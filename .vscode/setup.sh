git switch main
git fetch -p
git branch | grep -v "main" | xargs git branch -D || echo "No branch to delete" 
git pull
git checkout $(git show-ref --verify --quiet refs/heads/$USER || echo '-b') $USER
git push -u origin $USER && npm i