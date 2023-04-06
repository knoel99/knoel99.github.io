import sys

lines = []
for line in sys.stdin:
	lines.append(line.rstrip('\n'))

N = int(lines[0])
tab = [x.split() for x in lines[1:]]
di = dict()

for x in tab:
    if x[1] not in di:
        di[x[1]] = 0
    di[x[1]] += 1
l = []
for x in tab:
    if di[x[1]] == 1:
        l.append(int(x[0]))

l.sort()

for x in l:
    print(str(x))
