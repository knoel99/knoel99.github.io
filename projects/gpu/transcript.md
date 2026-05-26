# Inside an AI Chip — Reiner Pope (MatX) × Dwarkesh

**Dwarkesh:** I'm back with Reiner Pope, CEO of MatX, a new AI chip company. Last time we were talking about what happens inside a data center. Now I want to understand what happens inside an AI chip. How does a chip actually work? Full disclosure: I am an angel investor in MatX. So hopefully you have designed a good chip.

**Reiner:** Hope so.

---

## Building a multiply-accumulate from logic gates

### The fundamental primitives of chip design

**Reiner:** I'll start with the smallest fundamental unit of chip design, and we'll build up to what an actual production chip is and what its components are. At the very bottom level, the primitives we work with are logic gates — very simple things like AND, OR, and NOT. These are connected together by wires that have to be laid out physically as metal traces on a chip. The main function that AI chips want to compute is the multiplication of matrices. Inside that, the fundamental primitive is a multiply-accumulate of pairs of numbers. We're going to demonstrate what that calculation looks like by hand, and then infer what a circuit would look like for that.

It'll be easiest if I do a multiply-accumulate of a four-bit number with another four-bit number. There's a multiply of these two terms, and then we're going to add in an eight-bit number.

### Why multiply-accumulate is natural for AI chips

**Dwarkesh:** Why is this the natural primitive for whatever computation happens inside a computer?

**Reiner:** There are a few reasons. It's a little bit more efficient, but the reason it's natural for AI chips is that if you look at what's happening during a matrix multiply…

**Dwarkesh:** What is a matrix multiply in short?

**Reiner:** There's a for-loop over i, over j, and over k, of `output[i, k] += input[i, j] × other_input[j, k]`. A multiply-accumulate happens at every single step of a matrix multiply.

The other observation is that the precision will almost always be higher in the accumulation step than in the multiplication step. This is specific to AI chips. You're multiplying low-precision numbers, and then when you accumulate, errors accumulate quickly, so you need more precision there. This is why we've chosen to do a four-bit multiplication and an eight-bit addition.

**Dwarkesh:** There are two ways to understand that. One is that the value will be larger than the inputs. The other is that if it was a floating-point number it would be…

**Reiner:** It really is the same principle. As you're summing up this number, you're summing up a whole bunch of numbers, so you've got a lot of rounding errors accumulating. Whereas there's only one multiplication in the chain, so there aren't a lot of rounding errors accumulating in the multiplication.

### Long multiplication by hand

**Reiner:** As a human, we would probably separate it into two operations, but we can do it all in one using long multiplication. For the multiplication term first, we're going to multiply this four-bit number by every single bit position in the other four-bit number.

First, `1001` multiplied by the lowest bit position gives the number itself. Shifted across by one, we're multiplying by 0, which gives an all-0 number. Shifted one more, multiplying by 1 gives `1001` again. Finally, for the last bit position, we get an all-0 number again. This gives us a bunch of partial products to add. While we're doing that summation, we might as well add in the actual accumulator term too. So this is a five-way sum that we want to compute.

### AND gates for partial products

**Reiner:** We needed to produce all 16 of these partial products. We produce each one by multiplying a bit of the first number by a bit of the second. We can produce that with an AND gate — the result is 1 only if both input bits are 1. We ended up consuming 16 AND gates. In the general case, a `p`-bit multiply times a `q`-bit multiply needs `p × q` ANDs.

### Full adders and 3→2 compressors

**Reiner:** Now I sum them. Most of the work is going to happen in the summing. Let me describe the other logic gate that we use here. AND is almost the simplest logic gate that exists on a chip. At the other extreme, the very largest logic gate you'll typically use is something called a full adder.

Coming from software, you might think that a full adder adds 32-bit numbers together. In this case, it just adds three single-bit numbers together. When I add three bits, the result can be 0, 1, 2, or 3, so I can express that in binary using just two bits. As input, it has three bits; as output, two bits. This is also known as a 3→2 compressor.

**Dwarkesh:** Just to make sure I understood — the three inputs are an X and a Y value and then some carry that came in…

**Reiner:** The three inputs are all bits in the same column. The two outputs split into one bit in the same column (the sum) and one bit shifted left (the carry out). If the inputs are `101`, the output is `10`. If `111`, then `11`. This circuit captures what we as humans naturally do when we're summing along a column.

### The Dadda multiplier

**Reiner:** The way I sum here is going to be a little unnatural for humans. We would sum along the column and then remember the carry, but instead of remembering the carry, we'll explicitly write it out. We proceed from the rightmost column toward the left, applying full adders to triples of bits.

On the rightmost column, we sum 1 and 1, producing a zero and a carry of one. Next column has four numbers, so we take three of them, run a full adder, and get `00`. As I've used up bits, I cross them out. We keep applying full adders to triples in each column, constantly removing three numbers and writing two numbers out as output, until we eventually get just one single number coming out. This approach is called a **Dadda multiplier** — the standard for area-efficient multipliers using full adders.

### Circuit size analysis

**Reiner:** Let's quantify the circuit size. I started off with 24 bits (16 partial products plus the 8-bit accumulator). I eventually produced 8 bits on the output. Every use of a full adder eliminates one bit. So I used 24 − 8 = 16 full adders. In the general case, this will be `p × q` full adders.

**Dwarkesh:** Let me make sure I understand the logic. The input bits, 24, is `p × q + (p + q)`. The output bits are just `p + q`. So `p × q + (p + q) − (p + q) = p × q`.

**Reiner:** That's right. I think this explains the second reason we chose to do a multiply-accumulate. The first reason is that it's what shows up in matrix multiplication. The second is that it gave us this very slick, simple `p × q` algebra.

Every single atomic step here becomes a logic gate, and then the wires connect them together. This is the main primitive, at different bit widths, inside an AI chip.

### Quadratic scaling and FP4 vs FP8 trade-offs

**Dwarkesh:** Whenever Nvidia reports that this chip can do X many FP4 or half as many FP8, it seems to imply those circuits are fungible. But the way you're mapping it out, you would need a dedicated FP4 multiply-accumulate and a dedicated FP8 one. Can you "funge" them?

**Reiner:** As drawn, they're not particularly fungible. This is one of the main choices when designing a chip: how much FP4 and how much FP8 do I have? Sometimes I'll make that consideration from the customer requirement. Another angle is to equalize the power budget between FP4 and FP8.

**Dwarkesh:** When they report 2× as many FP4 as FP8, they're just giving equivalent die areas?

**Reiner:** Part of it is that surely it won't be exactly equivalent to die area. There's also a data movement reason. There's something really nice about the fact that I can pack two four-bit numbers into the same storage as an eight-bit number.

**Dwarkesh:** Come to think of it, the area sounds like it's quadratic with the bit length.

**Reiner:** This is a really big reason. Nvidia made a change. Historically, up until B100 or B200, every time you halved the bit precision, you doubled the FLOP count. Because of this quadratic scaling, that ratio is actually slightly wrong — you should get an even bigger speedup. Nvidia's product specs have started acknowledging that in B300 and beyond, where the FP4 is three times faster than the FP8. Though it should be 4×.

The big observation is this quadratic scaling with bit width, which is the single reason low-precision arithmetic has worked so well for neural nets.

---

## Muxes and the cost of data movement

### The CUDA core / CPU data path

**Reiner:** We'll walk back in time a little bit and see how GPUs prior to Tensor Cores worked, which is in fact the same way CPUs worked. Generically, in a CUDA core or a CPU, you'll have some register file storing some number of entries — maybe eight entries of, in this case, 4-bit numbers (typically 32-bit numbers). Inside the core, you have a multiply-accumulate circuit. It takes three arbitrary registers from this register file, performs the multiply-accumulate, and writes back to the register file. This is the core data path of many processors.

### What is a mux?

**Reiner:** We want to analyze the cost of the data movement from the register file to the ALU and back. Ultimately, there's going to be some circuit that lets us select any of the registers at any point in time. That circuit is a **mux** (multiplexer). In this case, it has eight inputs — one from each register file entry — and one output.

**Dwarkesh:** What the mux is doing is just selecting an input?

**Reiner:** Just selecting, invisible to software. You say "I want input number three," and that means there's a mux here.

### Cost analysis of a mux

**Reiner:** What's the cost of this thing? All we have to build it out of is AND and OR. We do the dumbest thing possible: form a mask. When we want to read the third entry, we AND every entry with either 1 or 0 based on whether that's what we want to read, then OR all of them together.

For an `n`-input mux operating on `p` bits, we need `n × p` AND gates (every bit of every input gets masked) and `(n − 1) × p` OR gates (collapsing the masked rows into one). We have three muxes (one per input to the multiply-accumulate), so the data-movement cost is `3 × n × p` AND gates compared to `p × q` gates in the actual circuit doing the thing we care about.

With `n = 8` and `q = 4`: `24 × p` gates in data movement versus `4 × p` gates in the multiply-adder. All this work scales with the size of the register file, and it's many times more expensive than the logic unit.

### Visualizing a 2-way mux

**Reiner:** Let's walk through a two-way mux. We have two different inputs and a selector that's one-hot encoded ("I want this one" or "I want the other one"). Very laboriously, we AND each selector bit with all the bits of its corresponding input row. One row becomes the actual input bits, the other becomes all zeros. Then we OR the rows together pairwise to get the final output. It ends up looking a little bit like addition — same ANDs as in multiplication, but collapsed with simple ORs instead of full adders.

### The hidden data movement problem

**Reiner:** In this circuit, almost all of the cost — seven-eighths — is in reading and writing the register file, and only a tiny fraction is in the logic unit itself. This is the problem to solve. This essentially was the state of play prior to the Volta generation of Nvidia GPUs. This is what motivated the introduction of Tensor Cores, more generically called **systolic arrays**.

We're spending almost all of our circuit area on something we don't care about and is hidden to the software programmer, and the thing we actually care about is not much of the area. The goal: make the logic part bigger somehow while keeping the data-movement part the same size.

---

## How systolic arrays work

### Going up one loop level

**Reiner:** At this stage, we had baked just one multiply-accumulate into hardware. The idea of a systolic array is to go two levels of loops up and bake an entire matrix-vector multiplication into hardware. If we have a much bigger granularity fixed-function piece of logic, maybe the taxes we pay on the input and output are much smaller.

**Dwarkesh:** It sounds like you're suggesting that if you go up one step in the matrix multiply loop, you can tilt the balance more towards compute than communication.

**Reiner:** That's right. There are two effects: we can do more stuff per trip through our register file, and we can take advantage of certain things staying fixed.

### Mapping matrix-vector multiplication

**Reiner:** Consider a matrix-vector multiplication where every column of the matrix gets multiplied by the vector and then summed. Each entry in the output vector is a dot product. We have one multiply-accumulate per matrix entry, so for a 2×2 matrix times a vector, we have four multiply-accumulates.

We want quadratic more compute (`x × y` compared to before), but only `x` more communication. Bringing in a vector of size two is already in line with our target — but communicating the full matrix every cycle would exceed our budget.

### Local weight storage in registers

**Reiner:** The idea is that in an AI context, this matrix stays fixed for a long period. We store the matrix entries locally in the systolic array, in registers right next to the logic. We reuse those numbers over and over again for a large number of different vectors.

**Dwarkesh:** The nature of matrix multiplication is that you can store this square quadratic thing directly where the logic is happening, which has an extra dimension compared to the inputs that you keep swapping in and out.

**Reiner:** That's right. A dot product is the result of a lot of multiplications, so you can stuff a lot of multiplication in before you get one value out.

Concretely: we feed the vector elements in at the top of columns and propagate sums downward. The 3 and 7 from the vector feed into both multiplications in their row. Sums accumulate vertically along columns, producing one dot product per column.

### Loading weights via daisy chain

**Reiner:** This leaves open the question: how did the matrix get there in the first place? At some point you need to boot your chip and populate this data. The trick is that we just do it very slowly. We trickle-feed it into the systolic array via a daisy chain. We feed a number into the top row, and on the next clock cycle it shifts down. Doing this in parallel across all columns keeps the wiring crossing the boundary of the systolic array bounded to `x`, not `x × y`.

**Dwarkesh:** There are two questions in terms of communication: communication time and communication bandwidth. You're saying that since we're only going to be loading this in once, let's minimize bandwidth, because bandwidth equals die area.

**Reiner:** Exactly.

### The recurring compute-vs-communication theme

**Dwarkesh:** It's interesting that when we were talking about inference across many chips, the big high-level thing was increasing compute per memory bandwidth. Here also, we're trying to increase actual multiplies relative to transporting information from registers to the logic.

**Reiner:** In both cases, you maximize compute relative to communication. This shows up all the way up and down the stack. There's a version even closer to the gates in the precision of the number format you choose. We saw that same effect — a squared versus linear term going on both in the precision of the ALU and in the size of the matrix.

This unit is the next bigger unit on top of the multiplication circuit. Older TPUs were described as 128×128 of this circuit. It's the most efficient known circuit for implementing a matrix multiply.

### Sizing trade-offs in chip design

**Dwarkesh:** What are non-obvious trade-offs that keep you up at night?

**Reiner:** Most decisions in chip design are sizing decisions. AI chips all have a systolic array and, near it, a register file providing inputs and outputs. The sizing questions are coupled: how big the systolic array, how big the register file? One way to think of it: set a budget for what percentage of chip area you want on data movement. Maybe 10% on data movement and 90% on the systolic array. Bigger register files are more flexible and give more application-level performance, but they take area away from the systolic array.

---

## Clock cycles and pipeline registers

### What is a clock cycle?

**Dwarkesh:** Where does the clock cycle come in? What determines it, and what is a clock cycle?

**Reiner:** At baseline, chips are incredibly parallel — 100 billion transistors. A key thing you need whenever you have massive parallelism is synchronization between the parallel units. In software, you have expensive synchronization methods like mutexes. On chips, we take a very different approach.

Every nanosecond or so, all circuitry in the chip pauses for a moment and synchronizes. That is the clock cycle. The entire chip typically goes in lockstep to the next operation in one fell swoop.

### Registers and the global clock signal

**Reiner:** In circuitry, the clock is mediated by registers — storage devices holding a bit, 0 or 1. Between registers, there's a cloud of logic with inputs and outputs. A global clock signal drives all the registers. When the clock strikes, whatever value happens to be on the input wire at that instant is what gets stored.

The challenge: I'd like the clock to run as fast as possible. At 2 GHz, I get twice as many operations as at 1 GHz. But I'm very sensitive to the delay through the cloud of logic, because any computation must finish before the next clock cycle hits. A major point of optimization is making this delay as short as possible.

### Pipeline register insertion

**Dwarkesh:** Is there ever a situation where you take a probabilistic chance that a computation finishes?

**Reiner:** In standard chip design, you margin it such that there is a probability, but it's many standard deviations out. For all intents and purposes, it's reliable. There are weird exceptions like clock domain crossings, but in the main path you'll get there 25% of the clock cycle in advance.

**Dwarkesh:** Where the registers are — is this something you determine as a chip designer?

**Reiner:** Inserting them is a huge part of designing a chip. It's done by a combination of manual and automatic methods. The very dumb version: take this logic, split it in half, two smaller clouds separated by a register. If you split in the middle, you can hit twice the clock frequency. Twice the performance, but at the cost of an extra register.

### Why synchronization is necessary

**Dwarkesh:** Why do we need to synchronize the whole chip? In Factorio there's no global clock cycle — things are just done when they're done.

**Reiner:** What you need to be mindful of is if I have two paths through some logic — say computations `f` and `g` that meet at `h`. Manufacturing variance means in some chips `f` is faster, in others `g` is faster. If a signal propagating through has results from `f` and `g` meeting at `h`, `f` might get there early and meet the previous value of `g`, or the next value of `g`.

This explains why different chips made at the same TSMC process node can have different clock cycles — based on whether they were able to optimize critical paths.

### Pipeline registers in feedback loops

**Reiner:** Pipeline register insertion is a pure trade-off between clock speed and area. That's the easy case. The harder case: when you have a calculation that feeds back on itself — for example, an addition where you sum a new number every clock cycle.

If this plus takes too long, putting a pipeline register in the middle changes the computation. Instead of one running sum, you'd end up with a running sum of even-indexed numbers and one of odd-indexed numbers. This constraint — a loop in logic, which all chips have somewhere — is the hardest thing to address and sets the clock cycle.

### Why you can't just keep adding registers

**Dwarkesh:** Can't you just take all the TSMC primitives and keep adding registers between them until you reach any desired clock cycle?

**Reiner:** As a logic designer, the chip architect sets the clock cycle. TSMC primitives are on the order of AND gates or full adders — maybe 10 picoseconds each. You can generally have 10 to 30 of these sequentially in a clock cycle. In principle, with just a register and an AND gate in a loop, you could get insanely fast clock speeds, more than 5 or 6 GHz.

But if you look at the area — the AND gate is one gate equivalent, the register is maybe eight. Almost all your cost becomes synchronization or communication compared to actual logic. You've gone too far: a really fast clock at the cost of spending almost all your area on pipeline registers.

### Clock speed vs throughput trade-off

**Dwarkesh:** You're hinting at a dynamic where you can have a really fast clock speed but not get much work done — low latency, low throughput.

**Reiner:** It hurts throughput. Throughput is the product of how much you get done per clock cycle (area efficiency) times how many clocks per second.

**Dwarkesh:** This is similar to batch size, where if you have a low batch size, any one user receives their next token really fast, but total tokens per hour is lower.

**Reiner:** Exactly. You get less parallelism if you drive your clock speed up really high.

---

## FPGAs vs ASICs

### Business case: cost vs flexibility

**Dwarkesh:** I remember talking to an FPGA engineer at Jane Street, Clark, who explained why they use FPGAs. For high-frequency trading, throughput is less important than latency, so having very specific control over the clock cycle in a deterministic way is the most important thing. Why use an FPGA versus an ASIC?

**Reiner:** FPGAs and ASICs use largely the same conceptual model. You have a series of gates built from small primitives — ANDs, ORs, XORs — connected by wires running in a fixed clock cycle. Anything expressible in an FPGA can be expressed in an ASIC too, about an order of magnitude cheaper and with better energy efficiency.

The trade-off: the first FPGA costs you $10,000, whereas the first ASIC costs $30 million because it requires a full tape-out. The FPGA business case is when you want deterministic latency, fast runtime, and high parallelism, but you'll change the workload frequently — maybe every month — and don't want to pay the tape-out cost.

### FPGA components: LUTs, registers, configurable muxes

**Reiner:** At its core, an FPGA has the two components we just talked about: registers as storage devices, and lookup tables (LUTs) providing all the gates. Then there's a third component: a swarm of these registers and LUTs connected by a big set of muxes. In front of every LUT and register, a mux selects an input from everywhere else.

When you program your FPGA, you superimpose a particular wiring: out of this LUT, into another LUT, into a register, into another LUT. **FPGA means Field-Programmable Gate Array.** "Field programmed" means the device is deployed in a data center, sitting out in the world, and then you come and program it.

The actual configuration of the FPGA amounts to the mux control. A little storage device sits next to every mux saying where to source its input from. Programming consists of configuring every one of these muxes.

### Inside the lookup table

**Reiner:** The lookup table also has a bit of control telling it what to do. Its purpose is to configurably take the role of an AND, OR, XOR, or any function. The way it's done in traditional FPGAs: a LUT has four bits of input and one bit of output. There are 16 different functions from 4 bits to 1 bit. You tabulate this as 16 entries of a truth table, stored in configuration bits. The LUT views the four input bits as binary, looks up the relevant row, and emits that bit.

**Dwarkesh:** So instead of a lookup table, you can just think of it as a programmable gate.

**Reiner:** That's right. The typical size for LUTs is four inputs — a sweet spot. There's another compute vs communication trade-off here: too few inputs means you need more LUTs.

### Why FPGAs are ~10× more expensive than ASICs

**Reiner:** Count how many gates are inside this lookup table. The LUT is essentially a mux selecting between 16 values — `n = 16`, `p = 1`. That's 16 ANDs and 16 ORs. The mux feeding the LUT's four input bits is itself made of four small muxes, each selecting from eight nearby registers/LUTs.

Consider a four-way AND. In an ASIC, three AND gates. Via a LUT: 32 gates. The overhead comes from the fact that listing every possible combination of inputs in a truth table is far less concise than just writing out the gate.

### Deterministic latency: CPUs vs FPGAs

**Dwarkesh:** One important point you made: the reason they prefer FPGAs to CPUs is that they get deterministic clock cycles. Why isn't that a guarantee in CPUs?

**Reiner:** You can actually design a CPU with deterministic latency. Processors inside many AI chips have deterministic latency — Groq has advertised this, TPUs have it in the core. The challenge is getting deterministic latency and high speed at the same time. Non-deterministic latency comes from specific design choices that aren't very attractive in the market.

In some sense, deterministic latency is the simpler starting point, and some chip designers have added things to make it non-deterministic.

---

## Cache vs scratchpad

### The CPU cache as a source of non-determinism

**Reiner:** Probably the most important source of non-determinism on a CPU is the cache itself. You have the CPU die and DDR memory off to the side. There's a cache system inside that remembers recent DDR accesses. When you run CPU instructions, every memory access first checks if the data is cached. If not, it fetches from DDR.

This is a huge optimization — the cache is two orders of magnitude faster than DDR. Without it, all programs would run a hundred times slower. The cache is absolutely necessary for reasonable speed.

But whether you get a cache hit depends on the ambient environment: what other programs are running, what ran recently, what the random-number generator inside the cache system is doing. That's a big source of non-determinism.

### Scratchpad: software-controlled memory

**Reiner:** Instead of having the hardware decide whether memory access comes from the cache, you can bake the decision into software. You see this in TPUs. You have HBM off-chip and a scratchpad on-chip. The key distinction: one kind of instruction reads/writes scratchpad, a totally different instruction reads/writes HBM. The software decides.

---

## Why CPU cores are much bigger than GPU cores

### Von Neumann and parallelism

**Dwarkesh:** Stepping way back: people say computers have the von Neumann architecture, where there's serial processing of information. But the FPGA is super parallel, AI accelerators are super parallel, even CPUs are parallel across cores. In what sense is modern hardware actually von Neumann?

**Reiner:** It's a fair way to describe CPUs. A CPU gives you about 100 cores × maybe 16-way vector units — about 1,000-way parallelism. That's modest compared to AI accelerators.

### CPU vs GPU die area

**Dwarkesh:** If there are so few cores, what are you spending all the die on?

**Reiner:** Cores are just much bigger and more complicated. Compare a CPU core, taking ~1/100 of the die, to a LUT, which is only 16 gates. It's clear why an FPGA has many more LUTs than a CPU has cores.

But why are there more CUDA cores than CPU cores? Inside the CPU, a big use of area is the cache. Very little is actually ALUs — mostly register files. Both have equivalents in GPUs. What does *not* have an equivalent in a GPU is the **branch predictor**.

### How the branch predictor works

**Dwarkesh:** What is the purpose of the branch predictor? To execute both branches at once?

**Reiner:** The issue: processing an instruction takes a really long time — maybe 5 nanoseconds. Noticing you have a branch, evaluating the Boolean, updating the program counter, and reading from instruction memory could take 5 ns to finish. But 5 ns is only 200 MHz, and I'd like to run at 1 or 2 GHz.

So I need to run other instructions while the branch is being evaluated — I keep running the instructions that happen after. But that might have been wrong. If the branch was taken, I needed to jump elsewhere. The branch predictor's purpose: predict, five cycles earlier, that a branch is going to happen, before you even get to that instruction.

There's a whole big area in the CPU that's just predictors saying when the next branch will be and where its target is. Stripping that out, and making register files tighter, drives a lot of the GPU's gains over the CPU.

---

## Brains vs chips

### Sparsity and co-location

**Dwarkesh:** If I think about how the brain works versus what you're describing — at a high level, while you can do structured sparsity in accelerators and save area, in the brain there's unstructured sparsity. Any neuron can connect to any other neuron, not in column-aligned ways. Then memory and compute are co-located.

**Reiner:** Although you could say memory and compute are co-located on these dies too. This is exactly the co-location in some sense.

### Clock speed and energy

**Dwarkesh:** Another big difference: the clock cycle on the brain is much slower than on computers. Partly to preserve energy — the faster the clock, the bigger the voltage needs to be for signals to settle.

**Reiner:** Let's take clock speed first. Clock speed is high on a chip because it drives higher throughput. When we compare a GPU running a workload, it's running batch size 1,000. The brain is not — there's only one of me. You could imagine taking a GPU and instead of running at 1 GHz, running at 1 MHz, and that would look a little more like the brain. But in silicon, that does *not* give you a 1,000× advantage in energy efficiency.

### Dynamic switching power

**Reiner:** A bit being stored means you've deposited charge in a capacitor sitting somewhere in the chip. It becomes charged when the bit is 1, discharged when it goes to 0. That cycle of charging and dumping charge to ground is where the energy is consumed. This is called **dynamic** or **switching** power, and it's most of a chip's energy consumption. There's some leakage from imperfect insulators, but we'll discard that.

If you clock a chip 1,000× slower, you'll have 1,000× fewer transitions and about 1,000× less energy consumption — but it's not a substantial advantage in energy *efficiency* (energy per operation stays similar).

---

## A GPU is just a bunch of tiny TPUs

### High-level GPU organization

**Reiner:** Let's compare the top-level block structure. A GPU is mostly a bunch of almost-identical units — the SMs. They've got an L2 memory in the middle, and more SMs on the bottom. A fairly regular grid of cores.

### High-level TPU organization

**Reiner:** A TPU has much coarser-grained units of logic. Just a few matrix units (the big systolic arrays), a vector unit in the middle, and matrix units at the bottom. From a high-level point of view, the GPU has a lot of tiny TPUs tiled across the whole chip.

**Dwarkesh:** You're suggesting the tensor core within a streaming SM is analogous to an MXU?

**Reiner:** Yeah, it's all very similar.

### The trade-off: large units vs data movement

**Dwarkesh:** If you had more lack of structure, having a bunch of tiny TPUs makes a lot of sense. If you just have huge matrix multiplications, you might want to avoid the cost of having individual SMs with their own registers and warp schedulers.

**Reiner:** This shows up in how large you can grow things. A larger systolic array amortizes register file costs better. The TPU design allows large systolic arrays; the GPU design constrains you to small units of everything.

There is a trade-off, however. Because of the coarse-grained separation in the TPU, you need to move data from the vector unit to the matrix units through just two lines of perimeter. In a GPU, you've got vector units everywhere, and you can move data through many lines — actually much higher bandwidth between vector and matrix units inside an SM than between equivalent units in a TPU. The moment you want to operate *across* SMs, however, it becomes more complicated and expensive.

### MatX's splittable systolic array

**Dwarkesh:** You don't have to comment, but one might expect that something MatX might try to do is get the GPU-like smaller structure of systolic arrays surrounded by SRAM, but discard the things you need in an SM to support the CUDA architecture.

**Reiner:** We've talked publicly about something we call a **splittable systolic array**, which in some sense you can think of as big systolic arrays that can be small systolic arrays too.

**Dwarkesh:** Cool. Okay, I think that's a good note to close on. Reiner, thank you so much.

**Reiner:** Thanks, Dwarkesh.
