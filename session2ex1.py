import sys

lines = []
for line in sys.stdin:
	lines.append(line.rstrip('\n'))

S = lines[0]

cur = S[0]

def gagnant(a,b):
    if a == b:
        return a
    if (a == 'P' and b == 'C') or (a == 'C' and b == 'F') or (a == 'F' and b == 'P'):
        return a
    return b

for x in S:
    cur = gagnant(cur, x)

print(cur)
