package model

type TableData struct {
	Caption string        `json:"caption"`
	Headers []TableHeader `json:"headers"`
	Rows    []TableRow    `json:"rows"`
}

type TableHeader struct {
	Dim  int    `json:"dim"`
	Name string `json:"name"`
}

type TableRow struct {
	ID     string       `json:"id"`
	Name   string       `json:"name"`
	Values []TableValue `json:"values"`
}

type TableValue struct {
	Dim   int    `json:"dim"`
	Value string `json:"value"`
}

type TableValuePlaceholder struct {
	Name  string
	Index int
}

var TableValueNameTemplate = "{{.Name}} Element {{.Index}}"
