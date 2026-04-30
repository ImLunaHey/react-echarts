/**
 * Base class for every error this library throws. Catch this if you
 * want a single handler for "something went wrong with react-echarts."
 */
export class ReactEChartsError extends Error {
  override name = 'ReactEChartsError';
  constructor(message: string, cause?: unknown) {
    super(message, cause !== undefined ? { cause } : undefined);
  }
}

/**
 * Thrown when an imperative method on a {@link ChartHandle} is called
 * before the chart has mounted (or after it has unmounted). Most often
 * caused by calling `ref.current.dispatchAction(...)` synchronously
 * during render — defer to an effect or event handler.
 */
export class NotInitialized extends ReactEChartsError {
  override name = 'ReactEChartsNotInitialized';
}
