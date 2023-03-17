package model

type PaginatedTableData struct {
	Columns []PaginatedTableColumn `json:"columns"`
	Rows    []PaginatedTableRow    `json:"rows"`
}

type PaginatedTableColumn struct {
	Title string `json:"title"`
}

type PaginatedTableRow struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}
