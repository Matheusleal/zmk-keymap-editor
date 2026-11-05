const test = require('node:test')
const assert = require('node:assert/strict')
const githubRoutes = require('../routes/github')
const { fetchWorkflowRuns, fetchRunArtifacts } = require('../services/github/workflows')
const api = require('../services/github/api')

test('GitHub Actions Workflow and Artifact API Tests', async (t) => {
  await t.test('FR-015: fetchWorkflowRuns formats workflow run payloads accurately', async () => {
    const originalRequest = api.request
    try {
      api.request = async ({ url, token }) => {
        assert.match(url, /\/repos\/user\/repo\/actions\/runs/)
        assert.match(url, /branch=main/)
        assert.equal(token, 'mock-token')
        return {
          data: {
            workflow_runs: [
              {
                id: 123456,
                name: 'Build ZMK Firmware',
                status: 'completed',
                conclusion: 'success',
                html_url: 'https://github.com/user/repo/actions/runs/123456',
                created_at: '2026-11-05T00:00:00Z',
                updated_at: '2026-11-05T00:02:00Z',
                head_branch: 'main',
                head_sha: 'abcdef123456'
              }
            ]
          }
        }
      }

      const runs = await fetchWorkflowRuns('mock-token', 'user/repo', 'main')
      assert.equal(runs.length, 1)
      assert.equal(runs[0].id, 123456)
      assert.equal(runs[0].status, 'completed')
      assert.equal(runs[0].conclusion, 'success')
      assert.equal(runs[0].head_sha, 'abcdef123456')
    } finally {
      api.request = originalRequest
    }
  })

  await t.test('FR-015: fetchRunArtifacts formats artifact download payloads', async () => {
    const originalRequest = api.request
    try {
      api.request = async ({ url, token }) => {
        assert.equal(url, '/repos/user/repo/actions/runs/123456/artifacts')
        assert.equal(token, 'mock-token')
        return {
          data: {
            artifacts: [
              {
                id: 998877,
                name: 'corne-left-zmk.uf2',
                size_in_bytes: 1048576,
                archive_download_url: 'https://api.github.com/repos/user/repo/actions/artifacts/998877/zip',
                expired: false,
                created_at: '2026-11-05T00:02:00Z'
              }
            ]
          }
        }
      }

      const artifacts = await fetchRunArtifacts('mock-token', 'user/repo', 123456)
      assert.equal(artifacts.length, 1)
      assert.equal(artifacts[0].name, 'corne-left-zmk.uf2')
      assert.equal(artifacts[0].size_in_bytes, 1048576)
      assert.equal(artifacts[0].archive_download_url, 'https://api.github.com/repos/user/repo/actions/artifacts/998877/zip')
    } finally {
      api.request = originalRequest
    }
  })

  await t.test('GitHub router registers actions runs and artifacts endpoints', () => {
    const registeredRoutes = githubRoutes.stack
      .filter(layer => layer.route)
      .map(layer => layer.route.path)

    assert.ok(
      registeredRoutes.includes('/installation/:installationId/:repository/actions/runs'),
      'actions/runs route should be registered'
    )
    assert.ok(
      registeredRoutes.includes('/installation/:installationId/:repository/actions/runs/:runId/artifacts'),
      'artifacts route should be registered'
    )
  })
})
