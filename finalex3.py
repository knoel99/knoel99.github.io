import sys

lines = []
for line in sys.stdin:
		lines.append(line.rstrip('\n'))

nbStartups = int(lines[0])

innovations = [lines[i].split() for i in range(1, nbStartups + 1)]
sol = 0
for premier in range(2):
    dpAvant = [i == premier for i in range(2)]
    for i in range(1, nbStartups):
        dpApres = [0] * 2
        for avant in range(2):
            for apres in range(2):
                if innovations[i-1][avant] != innovations[i][apres]:
                    dpApres[apres] += dpAvant[avant]
        dpAvant = dpApres
    for dernier in range(2):
        if nbStartups == 1 or innovations[0][premier] != innovations[-1][dernier]:
            sol += dpAvant[dernier]
print(str(sol))
