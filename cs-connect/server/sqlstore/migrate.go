package sqlstore

import (
	"fmt"

	"github.com/blang/semver"

	"github.com/mattermost/morph/drivers"
	"github.com/pkg/errors"

	ms "github.com/mattermost/morph/drivers/mysql"
	ps "github.com/mattermost/morph/drivers/postgres"

	"github.com/mattermost/mattermost-server/v6/model"
)

// RunMigrations will run the migrations (if any). The caller should hold a cluster mutex if there
// is a danger of this being run on multiple servers at once.
func (sqlStore *SQLStore) RunMigrations() error {
	currentSchemaVersion, err := sqlStore.GetCurrentVersion()
	if err != nil {
		return errors.Wrapf(err, "failed to get the current schema version")
	}

	// WARNING: Disable morph migrations until proper testing
	// if err := sqlStore.runMigrationsWithMorph(); err != nil {
	// 	return fmt.Errorf("failed to complete migrations (with morph): %w", err)
	// }

	if currentSchemaVersion.LT(LatestVersion()) {
		if err := sqlStore.runMigrationsLegacy(currentSchemaVersion); err != nil {
			return errors.Wrapf(err, "failed to complete migrations")
		}
	}

	return nil
}

func (sqlStore *SQLStore) runMigrationsLegacy(originalSchemaVersion semver.Version) error {
	currentSchemaVersion := originalSchemaVersion
	for _, migration := range migrations {
		if !currentSchemaVersion.EQ(migration.fromVersion) {
			continue
		}

		if err := sqlStore.migrate(migration); err != nil {
			return err
		}

		currentSchemaVersion = migration.toVersion
	}

	return nil
}

func (sqlStore *SQLStore) migrate(migration Migration) (err error) {
	tx, err := sqlStore.db.Beginx()
	if err != nil {
		return errors.Wrap(err, "could not begin transaction")
	}
	defer sqlStore.finalizeTransaction(tx)

	if err := migration.migrationFunc(tx, sqlStore); err != nil {
		return errors.Wrapf(err, "error executing migration from version %s to version %s", migration.fromVersion.String(), migration.toVersion.String())
	}

	if err := sqlStore.SetCurrentVersion(tx, migration.toVersion); err != nil {
		return errors.Wrapf(err, "failed to set the current version to %s", migration.toVersion.String())
	}

	if err := tx.Commit(); err != nil {
		return errors.Wrap(err, "could not commit transaction")
	}
	return nil
}

func (sqlStore *SQLStore) createDriver() (drivers.Driver, error) {
	driverName := sqlStore.db.DriverName()

	var driver drivers.Driver
	var err error
	switch driverName {
	case model.DatabaseDriverMysql:
		driver, err = ms.WithInstance(sqlStore.db.DB)
	case model.DatabaseDriverPostgres:
		driver, err = ps.WithInstance(sqlStore.db.DB)
	default:
		err = fmt.Errorf("unsupported database type %s for migration", driverName)
	}
	return driver, err
}
