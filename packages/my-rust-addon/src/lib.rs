use neon::prelude::*;

// Main function that takes a string argument and returns a greeting
fn hello_world(mut cx: FunctionContext) -> JsResult<JsString> {
    // Get the first argument as a string
    let input = cx.argument::<JsString>(0)?;
    let input_str = input.value(&mut cx);

    // Create the response message
    let message = format!("Hello from Rust! You said: {}", input_str);

    // Return the message as a JavaScript string
    Ok(cx.string(message))
}

// Export the functions to JavaScript
#[neon::main]
fn main(mut cx: ModuleContext) -> NeonResult<()> {
    cx.export_function("helloWorld", hello_world)?;
    Ok(())
}
