down:
	docker compose down
	docker rmi ssr:latest
up:
	rm -f ./data/temp/*
	docker compose up -d --build

init:
	mkdir -p data/{temp,whitelist,blacklist,logs,audio,template-audio}
	touch data/template-audio/{silent-{1,5,10,15}s,text{1,2,3,4},background-music}.mp3

clean:
	rm -rf data
