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

// TODO: refactor with composition
type IssuePaginatedTableData struct {
	Columns []PaginatedTableColumn   `json:"columns"`
	Rows    []IssuePaginatedTableRow `json:"rows"`
}

type IssuePaginatedTableRow struct {
	ID                        string `json:"id"`
	Name                      string `json:"name"`
	ObjectivesAndResearchArea string `json:"objectives_and_research_area"`
}