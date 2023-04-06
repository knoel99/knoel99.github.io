#*******
#* Read input from STDIN
#* Use print to output your result to STDOUT.
#* Use sys.stderr.write() to display debugging information to STDERR
#* ***/
import sys

lines = []
for line in sys.stdin:
    lines.append(line.rstrip('\n'))

n, m, e = map(int, lines[0].split())

can_go = False
for i in range(1, m + 1):
    l, r = map(int, lines[i].split().split())
    if l <= e <= r and l <= n <= r:
        can_go = True
        break

if can_go:
    print("YES")
else:
    print("NO")
