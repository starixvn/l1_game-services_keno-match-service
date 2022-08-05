docker image build --tag keno-match/local:latest -f Dockerfile .
docker run -p 8089:8089 -d keno-match/local:latest
