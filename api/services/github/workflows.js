const api = require('./api')

async function fetchWorkflowRuns (installationToken, repo, branch) {
  let url = `/repos/${repo}/actions/runs?per_page=5`
  if (branch) {
    url += `&branch=${encodeURIComponent(branch)}`
  }

  const { data } = await api.request({ url, token: installationToken })
  return (data.workflow_runs || []).map(run => ({
    id: run.id,
    name: run.name,
    status: run.status,
    conclusion: run.conclusion,
    html_url: run.html_url,
    created_at: run.created_at,
    updated_at: run.updated_at,
    head_branch: run.head_branch,
    head_sha: run.head_sha
  }))
}

async function fetchRunArtifacts (installationToken, repo, runId) {
  const url = `/repos/${repo}/actions/runs/${runId}/artifacts`
  const { data } = await api.request({ url, token: installationToken })

  return (data.artifacts || []).map(artifact => ({
    id: artifact.id,
    name: artifact.name,
    size_in_bytes: artifact.size_in_bytes,
    archive_download_url: artifact.archive_download_url,
    expired: artifact.expired,
    created_at: artifact.created_at
  }))
}

module.exports = {
  fetchWorkflowRuns,
  fetchRunArtifacts
}
