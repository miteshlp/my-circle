FROM node:hydrogen
WORKDIR ./my-circle-node-build

COPY ./ ./

RUN npm install 

CMD ["npm","start"]

# RUN this command in CMD
# docker build -t my-circle .

# build: command is used to create an image of DockerFile
# -t: is a flag that stands for title of images
# my-circle: is an image name(can be anything)
# (.): dot stands for context (which file or directory can be use by docker demoen to create image so (.) means current directory).
