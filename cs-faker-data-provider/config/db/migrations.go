package db

import (
	"github.com/blang/semver"
	"github.com/jmoiron/sqlx"
	"github.com/pkg/errors"
)

type Migration struct {
	fromVersion   semver.Version
	toVersion     semver.Version
	migrationFunc func(sqlx.Ext, *DB) error
}

const MySQLCharset = "DEFAULT CHARACTER SET utf8mb4"

var migrations = []Migration{
	{
		fromVersion: semver.MustParse("0.0.0"),
		toVersion:   semver.MustParse("0.1.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_System (
					SKey VARCHAR(64) PRIMARY KEY,
					SValue VARCHAR(1024) NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_System")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Issue (
					ID TEXT PRIMARY KEY,
					Name TEXT NOT NULL,
					ObjectivesAndResearchArea TEXT
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Issue")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Outcome (
					IssueID TEXT NOT NULL REFERENCES CSFDP_Issue(ID),
					ID TEXT NOT NULL,
					Outcome TEXT
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Outcome")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Role (
					IssueID TEXT NOT NULL REFERENCES CSFDP_Issue(ID),
					ID TEXT NOT NULL,
					UserID TEXT,
					Roles TEXT
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Role")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Element (
					IssueID TEXT NOT NULL REFERENCES CSFDP_Issue(ID),
					ID TEXT NOT NULL,
					Name TEXT NOT NULL,
					Description TEXT,
					OrganizationID TEXT NOT NULL,
					ParentID TEXT NOT NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Element")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Attachment (
					IssueID TEXT NOT NULL REFERENCES CSFDP_Issue(ID),
					ID TEXT NOT NULL,
					Attachment TEXT
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Attachment")
			}

			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.1.0"),
		toVersion:   semver.MustParse("0.2.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			// prior to v1.0.0, this migration was used to trigger the data migration from the kvstore
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.2.0"),
		toVersion:   semver.MustParse("0.3.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			if _, err := e.Exec(`
				ALTER TABLE CSFDP_Issue ADD DeleteAt bigint DEFAULT 0;
			`); err != nil {
				return errors.Wrapf(err, "failed updating table CSFDP_Issue")
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.3.0"),
		toVersion:   semver.MustParse("0.4.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy (
					ID TEXT PRIMARY KEY,
					Name TEXT NOT NULL,
					Description TEXT NOT NULL,
					OrganizationID TEXT NOT NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy_Purpose (
					Purpose TEXT PRIMARY KEY,
					PolicyID TEXT NOT NULL REFERENCES CSFDP_Policy(ID) ON DELETE CASCADE
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy_Purpose")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy_Element (
					Element TEXT PRIMARY KEY,
					PolicyID TEXT NOT NULL REFERENCES CSFDP_Policy(ID) ON DELETE CASCADE
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy_Element")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy_Need (
					Need TEXT PRIMARY KEY,
					PolicyID TEXT NOT NULL REFERENCES CSFDP_Policy(ID) ON DELETE CASCADE
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy_Need")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy_Role (
					Role TEXT PRIMARY KEY,
					PolicyID TEXT NOT NULL REFERENCES CSFDP_Policy(ID) ON DELETE CASCADE
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy_Role")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy_Reference (
					Reference TEXT PRIMARY KEY,
					PolicyID TEXT NOT NULL REFERENCES CSFDP_Policy(ID) ON DELETE CASCADE
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy_Reference")
			}

			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Policy_Tag (
					Tag TEXT PRIMARY KEY,
					PolicyID TEXT NOT NULL REFERENCES CSFDP_Policy(ID) ON DELETE CASCADE
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Policy_Tag")
			}

			return nil
		},
	},
}
