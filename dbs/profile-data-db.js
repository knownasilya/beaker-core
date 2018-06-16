import sqlite3 from 'sqlite3'
import path from 'path'
import fs from 'fs'
import globals from '../globals'
import {cbPromise} from '../lib/functions'
import {setupSqliteDB} from '../lib/db'

// globals
// =

var db
var migrations
var setupPromise

// exported methods
// =

export function setup () {
  // open database
  var dbPath = path.join(globals.userDataPath, 'Profiles')
  db = new sqlite3.Database(dbPath)
  setupPromise = setupSqliteDB(db, {setup: setupDb, migrations}, '[PROFILES]')
}

export async function get (...args) {
  await setupPromise
  return cbPromise(cb => db.get(...args, cb))
}

export async function all (...args) {
  await setupPromise
  return cbPromise(cb => db.all(...args, cb))
}

export async function run (...args) {
  await setupPromise
  return cbPromise(cb => db.run(...args, cb))
}

export function serialize () {
  return db.serialize()
}

export function parallelize () {
  return db.parallelize()
}

// internal methods
// =

function setupDb (cb) {
  db.exec(fs.readFileSync(path.join(__dirname, 'background-process', 'dbs', 'schemas', 'profile-data.sql'), 'utf8'), cb)
}
migrations = [
  migration('profile-data.v1.sql'),
  migration('profile-data.v2.sql'),
  migration('profile-data.v3.sql'),
  migration('profile-data.v4.sql'),
  migration('profile-data.v5.sql'),
  migration('profile-data.v6.sql'),
  migration('profile-data.v7.sql'),
  migration('profile-data.v8.sql'),
  migration('profile-data.v9.sql'),
  migration('profile-data.v10.sql'),
  migration('profile-data.v11.sql'),
  migration('profile-data.v12.sql'),
  migration('profile-data.v13.sql'),
  migration('profile-data.v14.sql'),
  migration('profile-data.v15.sql'),
  migration('profile-data.v16.sql', {canFail: true}), // set canFail because we made a mistake in the rollout of this update, see https://github.com/beakerbrowser/beaker/issues/934
  migration('profile-data.v17.sql')
]
function migration (file, opts = {}) {
  return cb => {
    if (opts.canFail) {
      var orgCb = cb
      cb = () => orgCb() // suppress the error
    }
    db.exec(fs.readFileSync(path.join(__dirname, 'background-process', 'dbs', 'schemas', file), 'utf8'), cb)
  }
}
