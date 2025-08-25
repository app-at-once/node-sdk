"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateCommand = void 0;
const commander_1 = require("commander");
const chalk_1 = __importDefault(require("chalk"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const index_1 = require("../../index");
try {
    const dotenv = require('dotenv');
    const envFiles = ['.env.local', '.env'];
    for (const envFile of envFiles) {
        const envPath = path.resolve(process.cwd(), envFile);
        if (fs.existsSync(envPath)) {
            dotenv.config({ path: envPath });
            console.log(chalk_1.default.gray(`Loaded environment from ${envFile}`));
            break;
        }
    }
}
catch (e) {
}
async function loadSchema(schemaPath) {
    const resolvedPath = path.resolve(process.cwd(), schemaPath);
    if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Schema file not found: ${resolvedPath}`);
    }
    if (resolvedPath.endsWith('.ts')) {
        console.log(chalk_1.default.yellow('⚠️  Loading TypeScript schema files requires ts-node or tsx to be installed'));
        console.log(chalk_1.default.gray('You can install it with: npm install -D ts-node'));
    }
    try {
        const schemaModule = await Promise.resolve(`${resolvedPath}`).then(s => __importStar(require(s)));
        return schemaModule.schema || schemaModule.default || schemaModule;
    }
    catch (error) {
        throw new Error(`Failed to load schema: ${error.message}`);
    }
}
function getApiConfig() {
    const apiKey = process.env.APPATONCE_API_KEY;
    if (!apiKey) {
        console.error(chalk_1.default.red('❌ APPATONCE_API_KEY not found!'));
        console.error('\\nPlease set it in your environment:');
        console.error('  export APPATONCE_API_KEY=your_api_key');
        console.error('\\nOr add it to a .env file in your project root');
        process.exit(1);
    }
    return { apiKey };
}
function createProgressHandler() {
    return (progress) => {
        switch (progress.type) {
            case 'info':
                console.log(chalk_1.default.blue(`ℹ️  ${progress.message}`));
                break;
            case 'progress':
                if (progress.current && progress.total) {
                    const percentage = Math.round((progress.current / progress.total) * 100);
                    const barLength = 30;
                    const filled = Math.round((barLength * progress.current) / progress.total);
                    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
                    let progressLine = `📊 [${bar}] ${percentage}% (${progress.current}/${progress.total})`;
                    if (progress.table) {
                        progressLine += chalk_1.default.gray(` - ${progress.table}`);
                    }
                    console.log(chalk_1.default.cyan(progressLine));
                }
                else {
                    console.log(chalk_1.default.yellow(`⏳ ${progress.message}`));
                }
                break;
            case 'complete':
                console.log(chalk_1.default.green(`✅ ${progress.message || 'Migration completed'}`));
                break;
            case 'error':
                console.log(chalk_1.default.red(`❌ ${progress.message}`));
                break;
        }
    };
}
async function runMigration(schemaPath, options) {
    const { apiKey } = getApiConfig();
    const client = new index_1.AppAtOnceClient(apiKey, 120000);
    try {
        console.log(chalk_1.default.blue('🚀 AppAtOnce Database Migration'));
        console.log(chalk_1.default.gray('================================\\n'));
        console.log(chalk_1.default.gray(`Loading schema from ${schemaPath}...`));
        const schema = await loadSchema(schemaPath);
        console.log(chalk_1.default.gray('Testing connection...'));
        const health = await client.ping();
        console.log(chalk_1.default.green(`✅ Connected to AppAtOnce (v${health.version})\\n`));
        if (!options.dryRun) {
            try {
                if (client.realtime && !client.realtime.isConnected()) {
                    console.log(chalk_1.default.gray('📡 Connecting to realtime server for progress updates...'));
                    await client.realtime.connect({ debug: false });
                    console.log(chalk_1.default.green('✅ Connected to realtime server'));
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
            catch (err) {
                console.log(chalk_1.default.yellow('⚠️  Could not connect to realtime server, progress updates disabled'));
            }
        }
        let result;
        const progressHandler = createProgressHandler();
        if (options.force) {
            console.log(chalk_1.default.red.bold('⚠️  WARNING: Force sync will DROP and recreate all tables!'));
            console.log(chalk_1.default.red.bold('⚠️  All data will be lost! Use with extreme caution.\\n'));
            if (!process.env.CI && !options.yes) {
                const readline = require('readline').createInterface({
                    input: process.stdin,
                    output: process.stdout
                });
                const answer = await new Promise((resolve) => {
                    readline.question(chalk_1.default.yellow('Type "yes" to confirm force sync: '), resolve);
                });
                readline.close();
                if (answer.toLowerCase() !== 'yes') {
                    console.log(chalk_1.default.yellow('\\n❌ Force sync cancelled'));
                    process.exit(0);
                }
            }
            result = await client.schema.migrate(schema, {
                force: true,
                dropTables: true,
                onProgress: progressHandler
            });
        }
        else if (options.sync) {
            console.log(chalk_1.default.cyan('📦 Running in sync mode (create new tables only)...\\n'));
            result = await client.schema.syncSchema(schema, {
                onProgress: progressHandler
            });
        }
        else {
            console.log(chalk_1.default.cyan('🔄 Running full migration...\\n'));
            if (options.dev && !options.dryRun) {
                console.log(chalk_1.default.yellow.bold('⚠️  Development mode enabled!'));
                console.log(chalk_1.default.yellow('This allows:'));
                console.log(chalk_1.default.yellow('  • Dropping columns'));
                console.log(chalk_1.default.yellow('  • Changing column types'));
                console.log(chalk_1.default.yellow('  • Dropping tables'));
                console.log(chalk_1.default.yellow.bold('⚠️  These operations can cause data loss!\\n'));
            }
            result = await client.schema.migrate(schema, {
                dryRun: options.dryRun,
                dev: options.dev,
                onProgress: progressHandler
            });
        }
        console.log('');
        if (result.success) {
            if (options.dryRun) {
                console.log(chalk_1.default.green('\\n✅ Dry run completed successfully'));
                console.log(chalk_1.default.gray('No changes were applied to the database'));
            }
            else {
                console.log(chalk_1.default.green('\\n✅ Migration completed successfully!'));
            }
        }
        else {
            console.error(chalk_1.default.red('\\n❌ Migration failed'));
            if (result.errors && result.errors.length > 0) {
                console.error(chalk_1.default.red('\\nErrors:'));
                result.errors.forEach((error) => {
                    console.error(chalk_1.default.red(`  - ${error}`));
                });
            }
            process.exit(1);
        }
    }
    catch (error) {
        console.error(chalk_1.default.red('\\n❌ Migration error:'), error.message);
        if (options.verbose && error.stack) {
            console.error(chalk_1.default.gray(error.stack));
        }
        process.exit(1);
    }
    finally {
        if (client.realtime && client.realtime.isConnected()) {
            console.log(chalk_1.default.gray('\\nDisconnecting from realtime server...'));
            client.realtime.disconnect();
        }
    }
}
exports.migrateCommand = new commander_1.Command('migrate')
    .description('Run database migrations')
    .argument('<schema>', 'Path to schema file (e.g., ./schema.ts or ./schema.js)')
    .option('-d, --dry-run', 'Preview changes without applying them')
    .option('-s, --sync', 'Only create new tables (safe mode)')
    .option('-f, --force', 'Force recreate all tables (WARNING: Data loss!)')
    .option('--dev', 'Development mode - allows column drops, type changes, and table drops')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-v, --verbose', 'Show detailed output')
    .action(runMigration);
exports.migrateCommand
    .command('up')
    .description('Apply pending migrations (default)')
    .argument('<schema>', 'Path to schema file')
    .option('-d, --dry-run', 'Preview changes without applying them')
    .option('--dev', 'Development mode - allows column drops, type changes, and table drops')
    .option('-v, --verbose', 'Show detailed output')
    .action((schema, options) => runMigration(schema, options));
exports.migrateCommand
    .command('sync')
    .description('Create new tables only (safe mode)')
    .argument('<schema>', 'Path to schema file')
    .option('-v, --verbose', 'Show detailed output')
    .action((schema, options) => runMigration(schema, { ...options, sync: true }));
exports.migrateCommand
    .command('force')
    .description('Force recreate all tables (WARNING: Data loss!)')
    .argument('<schema>', 'Path to schema file')
    .option('-y, --yes', 'Skip confirmation prompts')
    .option('-v, --verbose', 'Show detailed output')
    .action((schema, options) => runMigration(schema, { ...options, force: true }));
//# sourceMappingURL=migrate.js.map