
'use strict'

const fs = require('fs')
const ts = require('typescript')

module.exports = (configFileName, isProd) => {
  let configFileText = null
  try {
    configFileText = fs.readFileSync(configFileName).toString()
  }
  catch (e) {
    return Promise.reject(e)
  }

  const configResult = ts.parseConfigFileTextToJson(configFileName, configFileText)
  const configObject = configResult.config

  if (!configObject) {
    return Promise.reject(configResult.error)
  }

  const configParseResult = ts.parseJsonConfigFileContent(configObject, ts.sys, ts.getDirectoryPath(configFileName), null, configFileName)
  if (isProd) {
    configParseResult.options.sourceMap = false
    configParseResult.options.inlineSourceMap = false
    configParseResult.options.sourceRoot = null
    configParseResult.options.removeComments = true
  }

  const compilerOptions = configParseResult.options
  const compilerHost = ts.createCompilerHost(compilerOptions)
  const rootFileNames = configParseResult.fileNames
  const program = ts.createProgram(rootFileNames, compilerOptions, compilerHost)
  const result = program.emit()

  const diagnostics = ts.getPreEmitDiagnostics(program).concat(result.diagnostics)
  if (diagnostics.length === 0) {
    return Promise.resolve()
  }

  return Promise.reject(diagnostics.map((diagnostic) => {
    const {line, character} = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start)
    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')
    return `${diagnostic.file.fileName} (${line + 1}, ${character + 1}): ${message}`
  }))

}
