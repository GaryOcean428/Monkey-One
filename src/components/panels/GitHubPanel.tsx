import React, { useState, useEffect } from 'react';
import { GitBranch, GitCommit, GitPullRequest, Plus, AlertTriangle, Search, Link, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useGitHub } from '@/hooks/useGitHub';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export function GitHubPanel() {
  const { 
    searchRepositories,
    getBranches,
    getCommits,
    getPullRequests,
    initializeRepository,
    connectToRepository,
    searchResults,
    isLoading,
    error,
    isConfigured,
    clearError
  } = useGitHub();

  const [showNewRepoDialog, setShowNewRepoDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [repoName, setRepoName] = useState('');
  const [repoDescription, setRepoDescription] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'stars' | 'forks' | 'updated'>('stars');
  const [ownerName, setOwnerName] = useState('');
  const [repoToConnect, setRepoToConnect] = useState('');
  const [branches, setBranches] = useState([]);
  const [commits, setCommits] = useState([]);
  const [pullRequests, setPullRequests] = useState([]);

  useEffect(() => {
    if (isConfigured) {
      refreshData();
    }
  }, [isConfigured]);

  const refreshData = async () => {
    const [branchesData, commitsData, prsData] = await Promise.all([
      getBranches(),
      getCommits(),
      getPullRequests()
    ]);
    setBranches(branchesData);
    setCommits(commitsData);
    setPullRequests(prsData);
  };

  const handleCreateRepo = async () => {
    if (!repoName) return;
    
    const result = await initializeRepository(repoName, repoDescription);
    if (result) {
      setShowNewRepoDialog(false);
      setRepoName('');
      setRepoDescription('');
      await refreshData();
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    await searchRepositories(searchQuery, { sort: sortBy });
  };

  const handleConnect = async () => {
    if (!ownerName || !repoToConnect) return;
    
    const result = await connectToRepository(ownerName, repoToConnect);
    if (result) {
      setShowConnectDialog(false);
      setOwnerName('');
      setRepoToConnect('');
      await refreshData();
    }
  };

  if (!isConfigured) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">GitHub Not Configured</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Please configure your GitHub credentials to use this feature.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold dark:text-white">GitHub Integration</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowSearchDialog(true)}
            disabled={isLoading}
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowConnectDialog(true)}
            disabled={isLoading}
          >
            <Link className="w-4 h-4 mr-2" />
            Connect
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowNewRepoDialog(true)}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitBranch className="text-blue-500" size={20} />
              <h3 className="font-medium dark:text-white">Branches</h3>
            </div>
            <span className="text-sm text-gray-500">{branches.length}</span>
          </div>
          <div className="space-y-2">
            {branches.map((branch: any) => (
              <div key={branch.name} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <span className="text-sm dark:text-white">{branch.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitCommit className="text-green-500" size={20} />
              <h3 className="font-medium dark:text-white">Recent Commits</h3>
            </div>
            <span className="text-sm text-gray-500">{commits.length}</span>
          </div>
          <div className="space-y-2">
            {commits.map((commit: any) => (
              <div key={commit.sha} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-sm dark:text-white truncate">{commit.commit.message}</div>
                <div className="text-xs text-gray-500">{new Date(commit.commit.author.date).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <GitPullRequest className="text-purple-500" size={20} />
              <h3 className="font-medium dark:text-white">Pull Requests</h3>
            </div>
            <span className="text-sm text-gray-500">{pullRequests.length}</span>
          </div>
          <div className="space-y-2">
            {pullRequests.map((pr: any) => (
              <div key={pr.id} className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="text-sm dark:text-white truncate">{pr.title}</div>
                <div className="text-xs text-gray-500">#{pr.number} by {pr.user.login}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search Dialog */}
      <Dialog open={showSearchDialog} onOpenChange={setShowSearchDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Search Repositories</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repositories..."
                className="flex-1"
              />
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stars">Stars</SelectItem>
                  <SelectItem value="forks">Forks</SelectItem>
                  <SelectItem value="updated">Updated</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleSearch} disabled={!searchQuery || isLoading}>
                Search
              </Button>
            </div>

            {searchResults.length > 0 && (
              <div className="max-h-[400px] overflow-y-auto space-y-2">
                {searchResults.map((repo: any) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900 rounded-lg"
                  >
                    <div>
                      <h4 className="font-medium dark:text-white">{repo.full_name}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{repo.description}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const [owner, name] = repo.full_name.split('/');
                        setOwnerName(owner);
                        setRepoToConnect(name);
                        setShowSearchDialog(false);
                        setShowConnectDialog(true);
                      }}
                    >
                      Connect
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Connect Dialog */}
      <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to Repository</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Owner/Organization</label>
              <Input
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="e.g., octocat"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Repository Name</label>
              <Input
                value={repoToConnect}
                onChange={(e) => setRepoToConnect(e.target.value)}
                placeholder="e.g., Hello-World"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowConnectDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConnect} 
              disabled={!ownerName || !repoToConnect || isLoading}
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Repository Dialog */}
      <Dialog open={showNewRepoDialog} onOpenChange={setShowNewRepoDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Repository</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Repository Name</label>
              <Input
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="Enter repository name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={repoDescription}
                onChange={(e) => setRepoDescription(e.target.value)}
                placeholder="Enter repository description"
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowNewRepoDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateRepo} 
              disabled={!repoName || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Repository'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}