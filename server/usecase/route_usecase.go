package usecase

import (
	"container/heap"
	"fmt"
	"server/model"
	"server/repository"
)

type IRouteUsecase interface {
	GetRoute(request model.RouteRequest) (model.RouteResponse, error)
}

type routeUsecase struct {
	rr repository.IRouteRepository
}

func NewRouteUsecase(rr repository.IRouteRepository) IRouteUsecase {
	return &routeUsecase{rr}
}

func (ru *routeUsecase) GetRoute(request model.RouteRequest) (model.RouteResponse, error) {
	stations, err := ru.rr.GetAllStation()
	if err != nil {
		return model.RouteResponse{}, err
	}

	edges, err := ru.rr.GetAllNeighborDistance()
	if err != nil {
		return model.RouteResponse{}, err
	}

	mapStation := make(map[string]uint)
	for i, station := range stations {
		mapStation[station.Name] = uint(i)
	}

	graph := make([][]Pair, len(stations))
	for _, edge := range edges {
		graph[mapStation[edge.Station1]] = append(graph[mapStation[edge.Station1]], Pair{mapStation[edge.Station2], edge.Distance})
		graph[mapStation[edge.Station2]] = append(graph[mapStation[edge.Station2]], Pair{mapStation[edge.Station1], edge.Distance})
	}

	response := model.RouteResponse{}

    for _, desStation := range request.DestinationStations {
        destination := model.Destination{
            Destination: desStation,
            Routes:      []model.Route{},
        }

        for _, depStation := range request.DepartureStations {
            routeIndexes := dijkstra(mapStation, graph, depStation, desStation)

            route := model.Route{
                Stations: []model.LatLng{},
            }

            for _, stationIndex := range routeIndexes {
                station := stations[stationIndex]
                route.Stations = append(route.Stations, model.LatLng{Lat: station.Latitude, Lng: station.Longitude})
            }

            destination.Routes = append(destination.Routes, route)
        }

        response.Destinations = append(response.Destinations, destination)
    }

    return response, nil
}

type Pair struct {
	First  uint
	Second float64
}
type PriorityQueue []Pair

func (pq PriorityQueue) Len() int { return len(pq) }
func (pq PriorityQueue) Less(i, j int) bool {
	return float64(pq[i].Second) < float64(pq[j].Second)
}
func (pq PriorityQueue) Swap(i, j int) {
	pq[i], pq[j] = pq[j], pq[i]
}
func (pq *PriorityQueue) Push(x interface{}) {
	*pq = append(*pq, x.(Pair))
}
func (pq *PriorityQueue) Pop() interface{} {
	old := *pq
	n := len(old)
	x := old[n-1]
	*pq = old[0 : n-1]
	return x
}

func dijkstra(mapStation map[string]uint, graph [][]Pair, depStation string, desStation string) []uint {
	pq := make(PriorityQueue, 0)
	heap.Push(&pq, Pair{mapStation[depStation], 0})
	dist := make([]float64, len(graph))
	for i := 0; i < len(graph); i++ {
		dist[i] = 1e9
	}
	dist[mapStation[depStation]] = 0
	for len(pq) > 0 {
		top := heap.Pop(&pq).(Pair)
		u := top.First
		if top.Second > dist[u] {
			continue
		}
		for _, neighbor := range graph[u] {
			v := neighbor.First
			w := neighbor.Second
			if dist[v] > dist[u]+w {
				dist[v] = dist[u] + w
				heap.Push(&pq, Pair{v, dist[v]})
			}
		}
	}

	route := make([]uint, 0)
	current := mapStation[desStation]
	route = append(route, current)
	for current != mapStation[depStation] {
		found := false
		for _, u := range graph[current] {
			if dist[current] == dist[u.First] + u.Second {
				current = u.First
				route = append(route, current)
				found = true
				break
			}
		}
		if !found {
			// 適切な前の頂点が見つからない場合、エラーを処理する
			fmt.Println("エラー：経路が見つかりません")
			return nil
		}
	}
	for i, j := 0, len(route)-1; i < j; i, j = i+1, j-1 {
		route[i], route[j] = route[j], route[i]
	}
	return route
}
