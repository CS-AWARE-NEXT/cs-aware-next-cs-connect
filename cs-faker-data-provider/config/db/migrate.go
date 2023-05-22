package db

import (
	"log"

	"github.com/blang/semver"

	"github.com/pkg/errors"
)

// RunMigrations will run the migrations (if any). The caller should hold a cluster mutex if there
// is a danger of this being run on multiple servers at once.
func (db *DB) RunMigrations() error {
	currentSchemaVersion, err := db.GetCurrentVersion()
	if err != nil {
		return errors.Wrapf(err, "failed to get the current schema version")
	}

	if currentSchemaVersion.LT(LatestVersion()) {
		log.Println("Found migrations, executing migrations...")
		if err := db.runMigrationsLegacy(currentSchemaVersion); err != nil {
			return errors.Wrapf(err, "failed to complete migrations")
		}
		log.Println("Migrations executed")
	}

	return nil
}

func (db *DB) runMigrationsLegacy(originalSchemaVersion semver.Version) error {
	currentSchemaVersion := originalSchemaVersion
	for _, migration := range migrations {
		if !currentSchemaVersion.EQ(migration.fromVersion) {
			continue
		}

		if err := db.migrate(migration); err != nil {
			return err
		}

		currentSchemaVersion = migration.toVersion
	}

	return nil
}

func (db *DB) migrate(migration Migration) (err error) {
	tx, err := db.DB.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer db.FinalizeTransaction(tx)

	if err := migration.migrationFunc(tx, db); err != nil {
		return errors.Wrapf(err, "error executing migration from version %s to version %s", migration.fromVersion.String(), migration.toVersion.String())
	}

	if err := db.SetCurrentVersion(tx, migration.toVersion); err != nil {
		return errors.Wrapf(err, "failed to set the current version to %s", migration.toVersion.String())
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}
	return nil
}
