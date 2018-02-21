function createGithubApi(auth) {
    const gh = new GitHub(auth)
    
    async function getCurrentCommitSHA(repo, branch) {
        const ref = await repo.getRef('heads/' + branch)
        return ref.data.object.sha
    }
    async function getCurrentTreeSHA(repo, commitSHA) {
        const commit = await repo.getCommit(commitSHA)
        return commit.data.tree.sha
    }
    async function createFile(repo, path, content) {
        const blob = await repo.createBlob(content)
            
        return {
            sha: blob.data.sha,
            path: path,
            mode: '100644',
            type: 'blob'
        }
    }
    async function createTree(repo, treeSHA, ...files) {
        const tree = await repo.createTree(files, treeSHA)
        return tree.data.sha
    }
    async function createCommit(repo, commitSHA, treeSHA, message) {
        const commit = await repo.commit(commitSHA, treeSHA, message)
        return commit.data.sha
    }
    async function updateHead(repo, branch, commitSHA) {
        await repo.updateHead('heads/' + branch, commitSHA)
    }

    return {
        async getRepo(userName, repoName) {
            return await gh.getRepo(userName, repoName)
        },
        async changeFile(repo, branch, path, content, commitMessage) {
            const commitSHA = await getCurrentCommitSHA(repo, branch)
            const treeSHA = await getCurrentTreeSHA(repo, commitSHA)
            const file = await createFile(repo, path, content)
            const newTreeSHA = await createTree(repo, treeSHA, file)
            const newCommitSHA = await createCommit(repo, commitSHA, newTreeSHA, commitMessage)

            await updateHead(repo, branch, newCommitSHA)
        }
    }
}