import { formatNumber } from "./index"

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

type BarChartConfig = {
  title: string
  datasets: {
    label: string
    data: number[]
    backgroundColor: string
  }[]
  labels: string[]
}

export const barChart = ({ title, datasets, labels }: BarChartConfig) => {
  const config = {
    type: "bar",
    data: {
      labels,
      datasets,
    },
    options: {
      title: {
        display: true,
        text: title,
      },
      scales: {
        xAxes: [{ stacked: true }],
        yAxes: [{ stacked: true }],
      },
      plugins: {
        datalabels: {
          anchor: "center",
          align: "center",
          color: "#777",
          font: {
            weight: "normal",
          },
        },
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
