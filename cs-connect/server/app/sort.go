package app

// SortField enumerates the available fields we can sort on.
type SortField string

const (
	// SortByName sorts by the name of a playbook run.
	SortByName SortField = "name"
)

// SortDirection is the type used to specify the ascending or descending order of returned results.
type SortDirection string

const (
	// DirectionDesc is descending order.
	DirectionDesc SortDirection = "DESC"

	// DirectionAsc is ascending order.
	DirectionAsc SortDirection = "ASC"
)

func IsValidDirection(direction SortDirection) bool {
	return direction == DirectionAsc || direction == DirectionDesc
}
