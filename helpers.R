library(raster)
library(sf)
library(reshape2)
library(scales)
library(geojsonsf)
library(cartography)
library(rmapshaper)
library(r2d3)
library(rnaturalearth)

# Data Import

r <- raster("data/gpw_v4_population_count_adjusted_to_2015_unwpp_country_totals_rev11_2020_30_min.tif")

if(!file.exists("js/layers.js")){
x <- ne_countries(scale = 110, returnclass = "sf")
x <- x[,c("adm0_a3", "name")]
colnames(x) <- c("id","name","geometry")
#x <- ms_simplify(x, keep_shapes = TRUE, snap = TRUE, keep = 0.7, no_repair = FALSE, snap_interval = 0.2)
# x <- st_sf(geometry=st_union(x))
x <- sf_geojson(x)
js <- paste0("var countries = ",x,";")
write(js,"js/layers.js")
}

# ------------------------
# function 1: Data buiding
# ------------------------ 

getdata <- function(r, fact){

  # variables
  crs1 <- "+proj=eqc +lat_ts=0 +lat_0=0 +lon_0=0 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs"
  crs2 <- "+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs"
  span <- 1000

 
 # dots
  dots <- aggregate(r, fact=fact, fun=sum)
  dots <- as(dots, 'SpatialPointsDataFrame')
  dots <- st_as_sf(dots)
  dots <- st_transform(dots, crs1)
  colnames(dots) <- c("pop","geometry")
  dots$id <- paste0("X",row.names(dots))
  dots <- dots[dots$pop > 0,]
  dots <- dots[order(dots$pop, decreasing =TRUE),]
  dots$pct <-  round(cumsum(dots$pop) / sum(dots$pop) * 100,5)
  dots$threshold <- round(rescale(x=  c(1:length(dots$pop)), to = c(1, span)),0)
  
  # circles
  k <- 700
  dots$r <- sqrt(dots$pop*k)
  circles <- st_buffer(st_as_sf(dots), dist = dots$r, )
  circles <- ms_simplify(circles, keep = 0.04, keep_shapes  = TRUE)
  
  # distances
  d <- as.matrix(data.frame(st_distance(dots)))
  colnames(d) <- dots$id
  row.names(d) <- dots$id
  d <- melt(d)
  colnames(d) <- c("i","j","dist")
  d <- d[d$dist > 0,]

  threshold <- sort(unique(d$dist))[2]*1.6
  d <- d[d$dist <= threshold,]
  
  # links
  links <- getLinkLayer(x = dots, xid = "id", df = d, dfid = c("i", "j"))
  pop <- data.frame(dots)
  pop$geometry <- NULL
  links <- merge(x = links, y = pop, by.x ="i", by.y = "id", all.y =  FALSE)
  links <- merge(x = links, y = pop, by.x ="j", by.y = "id", all.y =  FALSE)
  x <- links[,c("threshold.x","threshold.y")]
  st_geometry(x) <- NULL
  links$threshold <-  apply(x, 1, FUN=max)
  links  <- links[,c("i","j","threshold","geometry")]
  
  # Clean
  colnames(circles)
  circles <- circles[,c("threshold","pop","pct","geometry")]
  circles$pop <- round(circles$pop/1000,-1)
  links <- links[,c("threshold","geometry")]  

  # eqc -> wgs84
  dots <- st_transform(circles, crs2)
  links <- st_transform(links, crs2)

  # return
  return(list(dots,links))
}


# -----------------------------------------------------
# function 2: Dots & Links selection and export to json
# -----------------------------------------------------

datatojson <- function(geometries, threshold) {

  dots <- geometries[[1]]
  links <- geometries[[2]]
  
  # share of the world
  pct <- dots[dots$threshold <= threshold,"pct"]
  pct <- max(pct$pct)

  # threshold
  dots <- dots[dots$threshold <= threshold,]
  links <- links[links$threshold <= threshold,]  
  
  # convert to geojson
  dots.json <- sf_geojson(dots, simplify = TRUE)
  links.json <- sf_geojson(links, simplify = FALSE)
  
  return(list(dots.json,links.json, pct))
}

