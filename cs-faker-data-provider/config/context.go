package config

type Context struct {
	RepositoriesMap map[string]interface{}
	EndpointsMap    map[string]string
}

func NewContext(repositoriesMap map[string]interface{}, endpointsMap map[string]string) *Context {
	return &Context{
		RepositoriesMap: repositoriesMap,
		EndpointsMap:    endpointsMap,
	}
}
