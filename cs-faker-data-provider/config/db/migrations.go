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
			// TODO: add it the first time and then comment it out
			// FIX: but it needs to pass if the column already exists
			// if _, err := e.Exec(`
			// 	ALTER TABLE CSFDP_Issue ADD DeleteAt bigint DEFAULT 0;
			// `); err != nil {
			// 	return errors.Wrapf(err, "failed updating table CSFDP_Issue")
			// }
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
					OrganizationID TEXT NOT NULL,
					Exported TEXT NOT NULL
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
	{
		fromVersion: semver.MustParse("0.4.0"),
		toVersion:   semver.MustParse("0.5.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Ecosystem_Graph_Nodes (
					ID TEXT PRIMARY KEY,
					Name TEXT,
					Description TEXT,
					Type TEXT
				);

				CREATE TABLE IF NOT EXISTS CSFDP_Ecosystem_Graph_Edges (
					ID TEXT PRIMARY KEY,
					SourceNodeID TEXT NOT NULL REFERENCES CSFDP_Ecosystem_Graph_Nodes(ID),
					DestinationNodeID TEXT NOT NULL REFERENCES CSFDP_Ecosystem_Graph_Nodes(ID),
					Kind TEXT
				);

				CREATE TABLE IF NOT EXISTS CSFDP_Locks (
					Key TEXT PRIMARY KEY,
					ExpiresAt integer NOT NULL,
					Owner TEXT NOT NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Attachment")
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.5.0"),
		toVersion:   semver.MustParse("0.6.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_Links (
					ID TEXT PRIMARY KEY,
					Name TEXT,
					Description TEXT,
					Link TEXT,
					OrganizationID TEXT NOT NULL,
					ParentID TEXT NOT NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_Links")
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.6.0"),
		toVersion:   semver.MustParse("0.7.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			if _, err := e.Exec(`
				CREATE TABLE IF NOT EXISTS CSFDP_News (
					ID TEXT PRIMARY KEY,
					Name TEXT,
					Description TEXT,
					Search TEXT,
					OrganizationID TEXT NOT NULL,
					ParentID TEXT NOT NULL
				);
			`); err != nil {
				return errors.Wrapf(err, "failed creating table CSFDP_News")
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.7.0"),
		toVersion:   semver.MustParse("0.8.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			alterStatements := []string{
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD Contacts TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD CollaborationPolicies TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD CriticalityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD ServiceLevelAgreement TEXT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD BcdrDescription TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD Rto TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD Rpo TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD ConfidentialityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD IntegrityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD AvailabilityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD CiaRationale TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD Mtpd TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD RealtimeStatus TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Nodes ADD EcosystemOrganization TEXT DEFAULT 'no';`,
			}

			// TODO: add it the first time and then comment it out
			// FIX: but it needs to pass if the column already exists
			for _, stmt := range alterStatements {
				if _, err := e.Exec(stmt); err != nil {
					return errors.Wrapf(err, "failed updating table CSFDP_Ecosystem_Graph_Nodes with statement: %s", stmt)
				}
			}
			return nil
		},
	},
	{
		fromVersion: semver.MustParse("0.8.0"),
		toVersion:   semver.MustParse("0.9.0"),
		migrationFunc: func(e sqlx.Ext, db *DB) error {
			alterStatements := []string{
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD Description TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD CriticalityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD ServiceLevelAgreement TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD BcdrDescription TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD Rto TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD Rpo TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD ConfidentialityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD IntegrityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD AvailabilityLevel INT;`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD CiaRationale TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD Mtpd TEXT DEFAULT '';`,
				`ALTER TABLE CSFDP_Ecosystem_Graph_Edges ADD RealtimeStatus TEXT DEFAULT '';`,
			}

			// TODO: add it the first time and then comment it out
			// FIX: but it needs to pass if the column already exists
			for _, stmt := range alterStatements {
				if _, err := e.Exec(stmt); err != nil {
					return errors.Wrapf(err, "failed updating table CSFDP_Ecosystem_Graph_Edges with statement: %s", stmt)
				}
			}
			return nil
		},
	},
}
