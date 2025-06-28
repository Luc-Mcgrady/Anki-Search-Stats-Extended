<script lang="ts">
    import { fsrsCalibrationGraph } from "./FSRScalibration"
    import type { LossBin } from "./MemorisedBar"

    let svg: SVGElement | undefined

    export let data: LossBin[]

    $: if (svg) fsrsCalibrationGraph(svg, data)
</script>

<svg bind:this={svg}></svg>
