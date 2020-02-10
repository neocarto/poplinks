source("helpers.R")

ui <- fluidPage(
  titlePanel("Experiment on Geo-Visualization of the World Population in 2020"),
  sidebarPanel(width = 2,
    sliderInput("fact",
                label = "Aggregation level",
                min = 3, max = 40, value = 16),
    helpText("The aggregation level is an indication of the resolution of the starting grid. Be careful, if you choose a low aggregation level, the calculation may take some time"),
    sliderInput("threshold",
                label = "Population threshold",
                min = 1, max = 1000, value = 150),
    helpText("The population threshold allows only densely populated areas to be displayed. The lines connect two sufficiently populated nearby locations"),
    hr(),
    helpText(a("Data source", href="https://sedac.ciesin.columbia.edu/data/collection/gpw-v4")),
    helpText("The map is based on the The Gridded Population of the World (GPW) data in 2020 and is generated on the fly with R+Shiny & D3.js."),
  ),

  
  mainPanel(width = 10,
  d3Output("d3", width = 800, height = 850)
  )
)

server <- function(input, output) {
  
  dataInput <- reactive({
  getdata(r,input$fact)
})

  output$d3 <- renderD3({
  
    json <- datatojson(dataInput(), input$threshold)
    
    r2d3(
      data = json,
      dependencies = c("js/topojson.min.js","js/layers.js"),
      container = "svg",
      d3_version = 5,
      script = "js/map.js",
      css = "css/style.css",
      options(list(r2d3.shadow = FALSE, x=30, y=30))
    )
   
  })    

}

shinyApp(ui = ui, server = server)

