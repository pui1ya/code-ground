/**
 * ============================================================================
 * executionService.js
 * ----------------------------------------------------------------------------
 * CodeSync Execution Service
 *
 * Responsibilities
 * ----------------
 * • Create isolated execution workspaces.
 * • Write source code into temporary files.
 * • Spawn transient Docker containers.
 * • Capture stdout/stderr.
 * • Enforce a hard 10-second timeout.
 * • Clean temporary resources.
 *
 * This service intentionally knows nothing about Express.
 * ============================================================================
 */

const fs = require("fs/promises");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { spawn } = require("child_process");

/* -------------------------------------------------------------------------- */

const EXECUTION_TIMEOUT = 10_000;

/* -------------------------------------------------------------------------- */
/* Supported Languages                                                        */
/* -------------------------------------------------------------------------- */

const LANGUAGES = {

    javascript: {
        extension: "js",
        image: "node:20-alpine",
        command: ["node", "/workspace/Main.js"],
    },

    python: {
        extension: "py",
        image: "python:3.11-alpine",
        command: ["python", "/workspace/Main.py"],
    },

    cpp: {
        extension: "cpp",
        image: "gcc:13",
        command: [
            "sh",
            "-c",
            "g++ /workspace/Main.cpp -o /workspace/app && /workspace/app",
        ],
    },

};

/* -------------------------------------------------------------------------- */
/* Execute                                                                     */
/* -------------------------------------------------------------------------- */

async function execute({

    language,

    code,

    stdin = "",

}) {

    const config = LANGUAGES[language];

    if (!config) {

        throw new Error(`Unsupported language: ${language}`);

    }

    const workspace = await createWorkspace();

    const filename = `Main.${config.extension}`;

    await fs.writeFile(

        path.join(workspace, filename),

        code,

        "utf8"

    );

    try {

        const result = await runDocker({

            workspace,

            image: config.image,

            command: config.command,

            stdin,

        });

        return result;

    }

    finally {

        await cleanupWorkspace(workspace);

    }

}

/* -------------------------------------------------------------------------- */
/* Docker                                                                      */
/* -------------------------------------------------------------------------- */

function runDocker({

    workspace,

    image,

    command,

    stdin,

}) {

    return new Promise((resolve, reject) => {

        const args = [

            "run",

            "--rm",

            "--network",

            "none",

            "-v",

            `${workspace}:/workspace`,

            image,

            ...command,

        ];

        const docker = spawn("docker", args);

        let stdout = "";

        let stderr = "";

        const started = Date.now();

        const timer = setTimeout(() => {

            docker.kill("SIGKILL");

            reject(new Error("Execution timed out."));

        }, EXECUTION_TIMEOUT);

        docker.stdout.on("data", data => {

            stdout += data.toString();

        });

        docker.stderr.on("data", data => {

            stderr += data.toString();

        });

        if (stdin) {

            docker.stdin.write(stdin);

        }

        docker.stdin.end();

        docker.on("error", err => {

            clearTimeout(timer);

            reject(err);

        });

        docker.on("close", code => {

            clearTimeout(timer);

            resolve({

                stdout,

                stderr,

                exit_code: code,

                success: code === 0,

                elapsed_ms: Date.now() - started,

            });

        });

    });

}

/* -------------------------------------------------------------------------- */
/* Workspace                                                                   */
/* -------------------------------------------------------------------------- */

async function createWorkspace() {

    const folder = path.join(

        os.tmpdir(),

        "codesync",

        crypto.randomUUID()

    );

    await fs.mkdir(folder, { recursive: true });

    return folder;

}

/* -------------------------------------------------------------------------- */

async function cleanupWorkspace(folder) {

    await fs.rm(folder, {

        recursive: true,

        force: true,

    });

}

/* -------------------------------------------------------------------------- */

function getSupportedLanguages() {

    return Object.keys(LANGUAGES);

}

/* -------------------------------------------------------------------------- */

module.exports = {

    execute,

    getSupportedLanguages,

};