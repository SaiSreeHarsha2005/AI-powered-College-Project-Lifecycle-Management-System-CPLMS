@REM ----------------------------------------------------------------------------
@REM Maven Wrapper Batch Script pointing to project-local Maven installation
@REM ----------------------------------------------------------------------------
@echo off
set "DIR=%~dp0"
set "MAVEN_CMD=%DIR%..\.tools\apache-maven-3.9.6\bin\mvn.cmd"

if exist "%MAVEN_CMD%" (
    call "%MAVEN_CMD%" %*
) else (
    mvn %*
)
