package db

import (
	"database/sql"

	sq "github.com/Masterminds/squirrel"
	"github.com/pkg/errors"
)

// getSystemValue queries the IR_System table for the given key
func (db *DB) getSystemValue(q queryer, key string) (string, error) {
	var value string

	err := db.GetBuilder(q, &value,
		sq.Select("SValue").
			From("CSFDP_System").
			Where(sq.Eq{"SKey": key}),
	)
	if err == sql.ErrNoRows {
		return "", nil
	} else if err != nil {
		return "", errors.Wrapf(err, "failed to query system key %s", key)
	}

	return value, nil
}

// setSystemValue updates the IR_System table for the given key.
func (db *DB) setSystemValue(e queryExecer, key, value string) error {
	result, err := db.ExecBuilder(e,
		sq.Update("CSFDP_System").
			Set("SValue", value).
			Where(sq.Eq{"SKey": key}),
	)
	if err != nil {
		return errors.Wrapf(err, "failed to update system key %s", key)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected > 0 {
		return nil
	}

	_, err = db.ExecBuilder(e,
		sq.Insert("CSFDP_System").
			Columns("SKey", "SValue").
			Values(key, value),
	)
	if err != nil {
		return errors.Wrapf(err, "failed to insert system key %s", key)
	}

	return nil
}
