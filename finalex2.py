import sys
import heapq as heap

lines = []
for line in sys.stdin:
        lines.append(line.rstrip('\n'))

def Dijkstra(nbSommets, edges, startingNodes):
    pq = []
    dis = [1e18] * nbSommets
    for u in startingNodes:
        dis[u] = 0
        heap.heappush(pq, (0, u))

    adj = [[] for u in range(nbSommets)]
    for ed in edges:
        u, v= ed
        u -= 1
        v -= 1
        adj[u] += [v]
        adj[v] += [u]

    while pq:
        d, node = heap.heappop(pq)
        if d > dis[node]:
            continue
        for v in adj[node]:
            if d + 1 < dis[v]:
                dis[v] = d + 1
                heap.heappush(pq, (dis[v], v))
    return dis

nbSommets, nbAretes, nbTricheurs = map(int, lines[0].split())
tricheurs = list(map(int, lines[1].split()))
tricheurs = [t - 1 for t in tricheurs]
edges = []
for i in range(2, nbAretes+2):
    u, v= map(int, lines[i].split())
    edges += [[u, v]]
dis0 = Dijkstra(nbSommets, edges, [0])
disTricheurs = Dijkstra(nbSommets, edges, tricheurs)
sol = []
for u in range(nbSommets):
    if dis0[u] < disTricheurs[u]:
        sol += [u + 1]
print(" ".join([str(x) for x in sol]))
