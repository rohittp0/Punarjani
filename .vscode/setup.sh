git switch main
git fetch -p
git pull
git checkout $(git show-ref --verify --quiet refs/heads/$USER || echo '-b') $USER
git push -u origin $USER && npm i