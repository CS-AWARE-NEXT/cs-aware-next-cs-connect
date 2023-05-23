package config

type Context struct {
	RepositoriesMap map[string]interface{}
}

func NewContext(repositoriesMap map[string]interface{}) *Context {
	return &Context{
		RepositoriesMap: repositoriesMap,
	}
}
