<script lang="ts">
  type PropsType = {
    href: string;
    label: string;
    icon: string;
  }
  const {
    href,
    label,
    icon
  }: PropsType = $props();

  const iconSrc = `/icons/${icon}.png`;
  const iconSrcGrayscale = `/icons/${icon}-grayscale.png`;
</script>

<a {href} title={label} class="flex center p">
  <img src={iconSrc} alt={label} />
</a>