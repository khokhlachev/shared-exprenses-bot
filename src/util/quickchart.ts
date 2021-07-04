const urlFromConfig = (config: unknown) => {
  /**
   * Telegram replyWithPhoto API method breaks
   * if a period is not encoded
   */
  return `https://quickchart.io/chart?c=${encodeURIComponent(
    JSON.stringify(config)
  ).replace(".", "%2E")}`
}

type LinearConfig = {
  title: string
  datasets: {
    label: string
    data: number[]
    borderColor: string
  }[]
  labels: string[]
}

export const linearChart = ({ title, datasets, labels }: LinearConfig) => {
  const config = {
    type: "line",
    data: {
      labels,
      datasets: datasets.map((config) => ({
        ...config,
        steppedLine: true,
        fill: false,
      })),
    },
    options: {
      responsive: true,
      title: {
        display: true,
        text: title,
      },
    },
  }

  return urlFromConfig(config)
}

type DoughnutConfig = {
  title: string
  data: number[]
  labels: string[]
  colors: string[]
}

export const doughnutChart = ({
  title,
  data,
  labels,
  colors,
}: DoughnutConfig) => {
  const config = {
    type: "doughnut",
    data: {
      datasets: [
        {
          data,
          backgroundColor: colors,
          label: "Наши расходы",
        },
      ],
      labels,
    },
    options: {
      title: {
        display: true,
        text: title,
      },
      layout: {
        padding: {
          bottom: 20,
        },
      },
    },
  }

  return urlFromConfig(config)
}
