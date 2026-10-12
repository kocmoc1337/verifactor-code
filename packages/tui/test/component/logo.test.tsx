/** @jsxImportSource @opentui/solid */
import { testRender } from "@opentui/solid"
import { expect, test } from "bun:test"
import { ConfigProvider } from "../../src/config"
import { Logo } from "../../src/component/logo"
import { ThemeProvider } from "../../src/context/theme"
import { emptyThemeSource } from "../fixture/fixture"
import { TestTuiContexts } from "../fixture/tui-environment"
import { createTuiResolvedConfig } from "../fixture/tui-runtime"

test("logo dissolves in and settles into the pixel wordmark", async () => {
  const app = await testRender(
    () => (
      <TestTuiContexts>
        <ConfigProvider config={createTuiResolvedConfig({})}>
          <ThemeProvider mode="dark" source={emptyThemeSource}>
            <Logo />
          </ThemeProvider>
        </ConfigProvider>
      </TestTuiContexts>
    ),
    { width: 80, height: 20 },
  )

  await app.renderOnce()
  const intro = app.captureCharFrame()
  await Bun.sleep(1300)
  await app.renderOnce()
  const settled = app.captureCharFrame()
  console.log(intro.split("\n").slice(0, 5).join("\n"))
  console.log(settled.split("\n").slice(0, 5).join("\n"))

  expect(intro).not.toEqual(settled)
  expect(settled).toContain("▄████▄")
  expect(settled).toContain("▀▄▀")
  expect(settled).not.toContain("·")
  expect(settled).toContain("██")
  app.renderer.destroy()
})
