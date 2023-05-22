package db

import (
	"database/sql"
	"log"

	_ "github.com/lib/pq"

	sq "github.com/Masterminds/squirrel"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

// maxJSONLength holds the limit we set for JSON data in postgres
// Since JSON data type is unboounded, we need to set a limit
// that we'll control manually.
const maxJSONLength = 256 * 1024 // 256KB

type DB struct {
	DB      *sqlx.DB
	Builder sq.StatementBuilderType
}

// New constructs a new instance of DB.
func New(dataSource, driverName string) (*DB, error) {
	sqlDB, err := sql.Open(driverName, dataSource)
	if err != nil {
		return nil, err
	}
	var db *sqlx.DB
	db = sqlx.NewDb(sqlDB, driverName)

	builder := sq.StatementBuilder.PlaceholderFormat(sq.Question)
	builder = builder.PlaceholderFormat(sq.Dollar)

	return &DB{
		db,
		builder,
	}, nil
}

// queryer is an interface describing a resource that can query.
//
// It exactly matches sqlx.Queryer, existing simply to constrain sqlx usage to this file.
type queryer interface {
	sqlx.Queryer
}

// builder is an interface describing a resource that can construct SQL and arguments.
//
// It exists to allow consuming any squirrel.*Builder type.
type builder interface {
	ToSql() (string, []interface{}, error)
}

// get queries for a single row, building the sql, and writing the result into dest.
//
// Use this to simplify querying for a single row or column. Dest may be a pointer to a simple
// type, or a struct with fields to be populated from the returned columns.
func (db *DB) GetBuilder(q sqlx.Queryer, dest interface{}, b builder) error {
	sqlString, args, err := b.ToSql()
	if err != nil {
		return errors.Wrap(err, "failed to build sql")
	}

	sqlString = db.DB.Rebind(sqlString)

	return sqlx.Get(q, dest, sqlString, args...)
}

// selectBuilder queries for one or more rows, building the sql, and writing the result into dest.
//
// Use this to simplify querying for multiple rows (and possibly columns). Dest may be a slice of
// a simple, or a slice of a struct with fields to be populated from the returned columns.
func (db *DB) SelectBuilder(q sqlx.Queryer, dest interface{}, b builder) error {
	sqlString, args, err := b.ToSql()
	if err != nil {
		return errors.Wrap(err, "failed to build sql")
	}

	sqlString = db.DB.Rebind(sqlString)

	return sqlx.Select(q, dest, sqlString, args...)
}

// execer is an interface describing a resource that can execute write queries.
//
// It allows the use of *sqlx.Db and *sqlx.Tx.
type execer interface {
	Exec(query string, args ...interface{}) (sql.Result, error)
	DriverName() string
}

type queryExecer interface {
	queryer
	execer
}

// exec executes the given query using positional arguments, automatically rebinding for the db.
func (db *DB) Exec(e execer, sqlString string, args ...interface{}) (sql.Result, error) {
	sqlString = db.DB.Rebind(sqlString)
	return e.Exec(sqlString, args...)
}

// exec executes the given query, building the necessary sql.
func (db *DB) ExecBuilder(e execer, b builder) (sql.Result, error) {
	sqlString, args, err := b.ToSql()
	if err != nil {
		return nil, errors.Wrap(err, "failed to build sql")
	}

	return db.Exec(e, sqlString, args...)
}

// finalizeTransaction ensures a transaction is closed after use, rolling back if not already committed.
func (db *DB) FinalizeTransaction(tx *sqlx.Tx) {
	// Rollback returns sql.ErrTxDone if the transaction was already closed.
	if err := tx.Rollback(); err != nil && err != sql.ErrTxDone {
		log.Printf("Failed to rollback transaction due to %s", err.Error())
	}
}
