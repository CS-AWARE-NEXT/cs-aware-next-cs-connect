package config

type Context struct {
	RepositoriesMap map[string]interface{}
	EndpointsMap    map[string]string
	Vars            map[string]string
}

func NewContext(
	repositoriesMap map[string]interface{},
	endpointsMap map[string]string,
	vars map[string]string,
) *Context {
	return &Context{
		RepositoriesMap: repositoriesMap,
		EndpointsMap:    endpointsMap,
		Vars:            vars,
	}
}
