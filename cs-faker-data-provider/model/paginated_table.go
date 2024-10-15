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

type ExtendedPaginatedTableData struct {
	Columns []PaginatedTableColumn      `json:"columns"`
	Rows    []ExtendedPaginatedTableRow `json:"rows"`
}

type ExtendedPaginatedTableRow struct {
	State         string `json:"state"`
	ClosedAt      string `json:"closedAt"`
	FirstObserved string `json:"firstObserved"`
	ID            string `json:"id"`
	Type          string `json:"type"`
	Group         string `json:"group"`
	AssignedTo    string `json:"assignedTo"`
	Where         string `json:"where"`
	Name          string `json:"name"`
	Description   string `json:"description"`
}

// TODO: refactor with composition
type IssuePaginatedTableData struct {
	Columns []PaginatedTableColumn   `json:"columns"`
	Rows    []IssuePaginatedTableRow `json:"rows"`
}

type IssuePaginatedTableRow struct {
	ID                        string `json:"id"`
	Name                      string `json:"name"`
	ObjectivesAndResearchArea string `json:"summaryOfEventAndQuestionsForEcosystem"`
}
