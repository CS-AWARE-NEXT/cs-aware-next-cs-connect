package repository

import (
	"fmt"
	"time"

	"github.com/CS-AWARE-NEXT/cs-aware-next-cs-connect/cs-faker-data-provider/config/db"
	sq "github.com/Masterminds/squirrel"
	"github.com/pkg/errors"
)

const MAX_LOCK_TIME = time.Minute * 30
const LOCK_TIME_EXTRA_TIME = time.Second * 30

// To be replaced in future with the correct service to handle this, like Redis
type CacheRepository struct {
	db *db.DB
}

func NewCacheRepository(db *db.DB) *CacheRepository {
	return &CacheRepository{
		db: db,
	}
}

/// Tries to lock the resource identified by the lockName argument.
/// Returns true if the locking succeeded, false otherwise.
func (r *CacheRepository) GetLock(lockName string, owner string, lockDelay int) (bool, error) {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return false, errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	currentUnix := time.Now().Unix()
	delay := time.Duration(int(time.Minute) * lockDelay)
	if delay > MAX_LOCK_TIME {
		return false, fmt.Errorf("can't lock resource for %s minutes (max is %s)", delay, MAX_LOCK_TIME)
	}
	// Add a few seconds to prevent the resource getting unlocked just as the user requests a refresh
	delay = delay + LOCK_TIME_EXTRA_TIME

	expiresAt := time.Now().Add(delay).Unix() // todo take it from the mattermost config somehow..
	sql := sq.
		Insert("CSFDP_Locks").
		SetMap(map[string]interface{}{
			"Key":       lockName,
			"ExpiresAt": expiresAt,
			"Owner":     owner,
		}).
		Suffix("ON CONFLICT (Key) DO UPDATE SET ExpiresAt = ?, Owner = ? WHERE CSFDP_Locks.Key = ? AND (CSFDP_Locks.ExpiresAt < ? OR CSFDP_Locks.Owner = ?)",
			expiresAt, owner, lockName, currentUnix, owner)
	result, err := r.db.ExecBuilder(tx, sql)
	if err != nil {
		return false, errors.Wrap(err, "could not generate lock")
	}
	if err := tx.Commit(); err != nil {
		return false, errors.Wrap(err, "could not commit transaction")
	}
	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return false, errors.Wrap(err, "could not check whether the lock succeeded")
	}
	if rowsAffected > 0 {
		return true, nil
	}
	return false, nil
}

func (r *CacheRepository) DropLock(lockName string, owner string) error {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Locks").
		Where(sq.Eq{"Key": lockName}).
		Where(sq.Eq{"Owner": owner})); err != nil {
		return errors.Wrap(err, fmt.Sprintf("could not delete lock %s owned by %s", lockName, owner))
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}
	return nil
}

func (r *CacheRepository) DropLockIfExists(lockName string) error {
	tx, err := r.db.DB.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer r.db.FinalizeTransaction(tx)

	if _, err := r.db.ExecBuilder(tx, sq.
		Delete("CSFDP_Locks").
		Where(sq.Eq{"Key": lockName})); err != nil {
		return errors.Wrap(err, "could not delete lock ecosystem-graph")
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}
	return nil
}
