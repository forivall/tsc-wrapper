
'use strict'

const {promisify} = require('util')
const fs = require('fs')
const ts = require('typescript')

const readFile = promisify(fs.readFile)


module.exports = async configFileName => {
  const configFileText = await readFile(configFileName, 'utf-8')
  const configResult = ts.parseConfigFileTextToJson(configFileName, configFileText)
  const configObject = configResult.config

  if (configObject == null) {
    throw configResult.error
  }

  const {fileNames, options} = ts.parseJsonConfigFileContent(configObject, ts.sys, ts.getDirectoryPath(configFileName), null, configFileName)
  const compilerHost = ts.createCompilerHost(options)
  const program = ts.createProgram(fileNames, options, compilerHost)
  const result = program.emit()

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics)
  if (diagnostics.length > 0) {
    const errors = diagnostics.map(({file, start, messageText}) => {
      const {line, character} = file.getLineAndCharacterOfPosition(start)
      const message = ts.flattenDiagnosticMessageText(messageText, '\n')
      return `${file.fileName} (${line + 1}, ${character + 1}): ${message}`
    })
    throw errors
  }

}
