/** @jsxImportSource @opentui/solid */
import { testRender } from "@opentui/solid"
import { expect, test } from "bun:test"
import { ConfigProvider } from "../../src/config"
import { BootSplash } from "../../src/component/boot-splash"
import { ThemeProvider } from "../../src/context/theme"
import { emptyThemeSource } from "../fixture/fixture"
import { TestTuiContexts } from "../fixture/tui-environment"
import { createTuiResolvedConfig } from "../fixture/tui-runtime"

test("boot splash shows the wordmark and Russian progress, then dissolves away", async () => {
  process.env.SPLASH_TEST = "1"
  const app = await testRender(
    () => (
      <TestTuiContexts>
        <ConfigProvider config={createTuiResolvedConfig({})}>
          <ThemeProvider mode="dark" source={emptyThemeSource}>
            <box width="100%" height="100%">
              <text>под заставкой</text>
              <BootSplash ready={() => true} />
            </box>
          </ThemeProvider>
        </ConfigProvider>
      </TestTuiContexts>
    ),
    { width: 90, height: 24 },
  )

  const frameAt = async (ms: number) => {
    await Bun.sleep(ms)
    await app.renderOnce()
    return app.captureCharFrame()
  }

  const middle = await frameAt(1500)
  if (process.env.SPLASH_PRINT) console.log(middle)
  expect(middle).toContain("▀▄▀")
  expect(middle).toContain("ИИ-АССИСТЕНТ")
  expect(middle).toMatch(/\d+%/)
  expect(middle).not.toContain("под заставкой")

  const after = await frameAt(1800)
  if (process.env.SPLASH_PRINT) console.log(after)
  expect(after).toContain("под заставкой")
  app.renderer.destroy()
})
