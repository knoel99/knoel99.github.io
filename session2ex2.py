import sys

lines = []
for line in sys.stdin:
	lines.append(line.rstrip('\n'))
    
N = int(lines[0])
K = int(lines[1])
J = list(map(int, lines[2].split()))
somme = sum(J)
curJour = 1 + (K - 1) % somme
saison = 0
nbJours = 0
while nbJours < curJour:
    nbJours += J[saison]
    saison += 1
print(saison)
