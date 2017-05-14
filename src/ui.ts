import * as blessed from 'blessed'
import * as contrib from 'blessed-contrib'
import * as util from 'util'

export default class UI {
	private screen: blessed.Widgets.Screen
	private layout: blessed.Widgets.LayoutElement
	private table: blessed.Widgets.TableElement
	private statusText: blessed.Widgets.TextElement
	private progressBar: blessed.Widgets.ProgressBarElement
	private loading: blessed.Widgets.LoadingElement
	private stdout: blessed.Widgets.BoxElement

	constructor() {
		this.screen = blessed.screen({
			smartCSR: true,
			fullUnicode: true,
		})

		this.screen.key(['escape', 'q', 'C-c'], function (ch: any, key: any) {
			return process.exit(0);
		})

		this.layout = blessed.layout({
			parent: this.screen,
			width: '100%',
			height: '100%',
			layout: 'grid'
		})

		this.statusText = blessed.text({
			parent: this.layout,
			width: '100%',
			style: {
				fg: 'cyan'
			}
		})

		this.table = blessed.table({
			parent: this.layout,
			width: '100%',
			border: 'line',
			align: 'left',
			tags: true
		})

		this.progressBar = blessed.progressbar({
			parent: this.layout,
			style: {
				bg: 'gray',
				bar: {
					bg: 'red'
				}
			},
			width: '100%',
			orientation: 'horizontal'
		} as any)

		this.loading = blessed.loading({
			parent: this.layout,
			label: 'blaa'
		})

		this.stdout = blessed.box({
			parent: this.layout,
			scrollable: true,
			scrollbar: {
				style: {
					bg: 'magenta'
				},
				track: {
					bg: 'white'
				}
			},
			alwaysScroll: true,
			keys: true,
			mouse: true,
			tags: true,
			width: '100%',
			border: 'line',
			label: 'Output'
		})

		console.log = (message?: any, ...optionalParams: any[]) => {
			this.appendLog(message, optionalParams)
		}
		console.error = (message?: any, ...optionalParams: any[]) => {
			this.appendLog(message, optionalParams, 'red')
		}
		console.warn = (message?: any, ...optionalParams: any[]) => {
			this.appendLog(message, optionalParams, 'yellow')
		}
		console.info = (message?: any, ...optionalParams: any[]) => {
			this.appendLog(message, optionalParams, 'cyan')
		}
		console.debug = (message?: any, ...optionalParams: any[]) => {
			this.appendLog(message, optionalParams, 'gray')
		}
		process.on('uncaughtException', (error: any) => {
			this.appendLog('Uncaught Exception', undefined, 'white', 'red')
			console.error(error)
		})
		process.on('unhandledRejection', (reason: any, p: Promise<any>) => {
			this.appendLog('Unhandled Rejection', undefined, 'white', 'red')
			console.error(reason)
		})
	}

	appendLog(value: string, optionalParams?: any[], color?: string, bgColor?: string) {
		let debugString

		if (typeof value === 'string') {
			debugString = value
		} else {
			const inspectOptions = {
				colors: !color,
				depth: 10,
				showHidden: true
			}
			debugString = util.inspect(value, inspectOptions)
			if (optionalParams) {
				debugString += util.inspect(optionalParams, inspectOptions)
			}
		}

		if (color) {
			debugString = `{${color}-fg}${debugString}{/${color}-fg}`
		}
		if (bgColor) {
			debugString = `{${bgColor}-bg}${debugString}{/${bgColor}-bg}`
		}

		this.stdout.content += `${debugString}\n`
		this.stdout.setScrollPerc(100)
		this.render()
	}

	setProgress(maxProgress: number, progress: number) {
		const percentage = Math.round(progress / maxProgress * 100 * 100) / 100
		this.progressBar.setProgress(percentage)
		this.render()
	}

	setStatusText(statusText: string) {
		this.statusText.setText(statusText)
		this.render()
	}

	setTableData(headerRow: string[], tableData: string[][]) {
		tableData.unshift(headerRow)
		this.table.setData(tableData)
		this.render()
	}

	render() {
		this.screen.render()
	}
}
