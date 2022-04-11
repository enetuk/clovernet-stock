# Don't forget to login before
# docker login registry.gitlab.com

docker build -t registry.gitlab.com/startblockonline/likelib-relayer .
docker push registry.gitlab.com/startblockonline/likelib-relayer