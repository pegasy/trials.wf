FROM jekyll/jekyll as build-env
WORKDIR /app
COPY . ./
RUN mkdir _site
RUN jekyll build

FROM nginx:alpine

COPY --from=build-env /app/_site /usr/share/nginx/html
EXPOSE 80
