package util

// Merge the second map into the first map
func MergeMaps[K comparable, V any](map1 map[K]V, map2 map[K]V) {
	for key, value := range map2 {
		map1[key] = value
	}
}
