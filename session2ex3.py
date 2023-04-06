import sys

lines = []
for line in sys.stdin:
	lines.append(line.rstrip('\n'))

def isSolvable(N, E, ascenseurs):
    ascenseurs = list(sorted(ascenseurs))

    highest = E
    for ascenseur in ascenseurs:
        if highest < ascenseur[0]:
            return False
        highest = max(highest, ascenseur[1])
    return highest == N
    
    
N, M, E = map(int, lines[0].split())

ascenseurs = []
for i in range(M):
    x, y = map(int, lines[i+1].split())
    ascenseurs.append((x,y))

if isSolvable(N, E, ascenseurs):
    print("YES")
else:
    print("NO")

