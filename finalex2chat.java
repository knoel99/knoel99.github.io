import sys
from collections import defaultdict, deque

def bfs(graph, start, cheaters_set):
    distances = [float('inf')] * (len(graph) + 1)
    distances[start] = 0
    queue = deque([start])

    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if distances[neighbor] == float('inf'):
                distances[neighbor] = distances[node] + 1
                if neighbor not in cheaters_set:
                    queue.append(neighbor)

    return distances

lines = []
for line in sys.stdin:
    lines.append(line.rstrip('\n'))

n, m, t = map(int, lines[0].split())
cheaters = set(map(int, lines[1].split()))
graph = defaultdict(list)

for line in lines[2:]:
    u, v = map(int, line.split())
    graph[u].append(v)
    graph[v].append(u)

winner_distances = bfs(graph, 1, cheaters)
cheater_distances = bfs(graph, 0, cheaters)

safe_buildings = []

for i in range(2, n+1):
    if winner_distances[i] < cheater_distances[i]:
        safe_buildings.append(i)

print(" ".join(map(str, safe_buildings)))
