#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const migrate_1 = require("./commands/migrate");
commander_1.program
    .name('appatonce')
    .description('AppAtOnce SDK CLI - Database migrations and more')
    .version('2.0.0');
commander_1.program.addCommand(migrate_1.migrateCommand);
commander_1.program.parse(process.argv);
//# sourceMappingURL=index.js.map