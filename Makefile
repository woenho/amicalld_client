# * ---------------------
# * UTF-8 한글확인 용
# * ---------------------
 

all: 
	mkdir -p ../amicalld/www
	cp -p * ../amicalld/www
	mkdir -p ~/bin/www
	cp -p * ~/bin/www

clean:
	rm -rf ../amicalld/www
	rm -rf ~/bin/www
